module Jekyll
  module Paginate
    class Pager

      attr_reader :page, :per_page, :posts, :total_posts, :total_pages, :previous_page,
        :previous_page_path, :next_page, :next_page_path, :first_page_path, :page_path

      # Calculate the number of pages.
      #
      # all_posts - The Array of all Posts.
      # per_page  - The Integer of entries per page.
      #
      # Returns the Integer number of pages.
      def self.calculate_pages(all_posts, per_page)
        (all_posts.size.to_f / per_page.to_i).ceil
      end

      # Determine if pagination is enabled the site.
      #
      # site - the Jekyll::Site object
      #
      # Returns true if pagination is enabled, false otherwise.
      def self.pagination_enabled?(site)
        !site.config['paginate'].nil? &&
         site.pages.size > 0
      end

      # Static: Determine if a page is a possible candidate to be a template page.
      #         Page's name must be `index.html` and exist in any of the directories
      #         between the site source and `paginate_path`.
      #         不在paginate_path 这条路径树上的index.html 文件都不会成为candidate
      #         但凡是在paginate_path 这条路径树上的index.html 都会加入candidate，最终经过
      #         template_page 的筛选，选出匹配paginate_path 最长的作为template。
      #
      # config - the site configuration hash
      # page   - the Jekyll::Page about which we're inquiring
      #
      # Returns true if the
      def self.pagination_candidate?(config, page)
        page_dir = File.dirname(File.expand_path(remove_leading_slash(page.path), config['source'])) # File.dirname做的事情是路径向上跳一层
        paginate_path = remove_leading_slash(config['paginate_path'])
        paginate_path = File.expand_path(paginate_path, config['source'])
        page.name == 'index.html' &&
          in_hierarchy(config['source'], page_dir, File.dirname(paginate_path))
      end

      # Determine if the subdirectories of the two paths are the same relative to source
      #
      # source        - the site source
      # page_dir      - the directory of the Jekyll::Page
      # paginate_path - the absolute paginate path (from root of FS)
      #
      # Returns whether the subdirectories are the same relative to source
      def self.in_hierarchy(source, page_dir, paginate_path)
        return false if paginate_path == File.dirname(paginate_path)
        return false if paginate_path == Pathname.new(source).parent
        page_dir == paginate_path ||
          in_hierarchy(source, page_dir, File.dirname(paginate_path))
      end

      # Static: Return the pagination path of the page
      #
      # site     - the Jekyll::Site object
      # num_page - the pagination page number
      #
      # Returns the pagination path as a string
      def self.paginate_path(site, num_page)
        return nil if num_page.nil?
        return Pagination.first_page_url(site) if num_page <= 1
        format = site.config['paginate_path']
        format = format.sub(':num', num_page.to_s)
        ensure_leading_slash(format)
      end

      # Static: Return a String version of the input which has a leading slash.
      #         If the input already has a forward slash in position zero, it will be
      #         returned unchanged.
      #
      # path - a String path
      #
      # Returns the path with a leading slash
      def self.ensure_leading_slash(path)
        path[0..0] == "/" ? path : "/#{path}"
      end

      # Static: Return a String version of the input without a leading slash.
      #
      # path - a String path
      #
      # Returns the input without the leading slash
      def self.remove_leading_slash(path)
        ensure_leading_slash(path)[1..-1]
      end

      # Initialize a new Pager.
      #
      # site     - the Jekyll::Site object
      # page      - The Integer page number.
      # all_posts - The Array of all the site's Posts.
      # num_pages - The Integer number of pages or nil if you'd like the number
      #             of pages calculated.
      def initialize(site, page, all_posts, num_pages = nil)
        @page = page
        @per_page = site.config['paginate'].to_i
        @total_pages = num_pages || Pager.calculate_pages(all_posts, @per_page)

        if @page > @total_pages
          raise RuntimeError, "page number can't be greater than total pages: #{@page} > #{@total_pages}"
        end

        init = (@page - 1) * @per_page
        offset = (init + @per_page - 1) >= all_posts.size ? all_posts.size : (init + @per_page - 1)

        @total_posts = all_posts.size
        @posts = all_posts[init..offset]
        @previous_page = @page != 1 ? @page - 1 : nil
        @previous_page_path = Pager.paginate_path(site, @previous_page)
        @next_page = @page != @total_pages ? @page + 1 : nil
        @next_page_path = Pager.paginate_path(site, @next_page)
        # 每一个分类文件组的非第一页在寻找第一页对应的path 时，总是可以找到最佳匹配paginate_paths 的那个index 的路径，因为第一页总是最先创建，所以
        # 一定可以被其他页通过最佳匹配找到，那么问题来了，第一页创建的时候它的first_page_path 怎么填呢？此时，它本身都尚未创建，也就不可能找得到它
        # 自己的路径，所以它的first_page_path 填的就是已有的index 里面最佳匹配paginate_paths 的那个index，如根目录下的index，路径就为'/'
        @first_page_path = Pager.paginate_path(site, 1)
        @page_path = Pager.ensure_leading_slash(File.dirname(site.config['paginate_path']))
      end

      # Convert this Pager's data to a Hash suitable for use by Liquid.
      #
      # Returns the Hash representation of this Pager.
      def to_liquid
        {
          'page' => page,
          'per_page' => per_page,
          'posts' => posts,
          'total_posts' => total_posts,
          'total_pages' => total_pages,
          'previous_page' => previous_page,
          'previous_page_path' => previous_page_path,
          'next_page' => next_page,
          'next_page_path' => next_page_path,
          'first_page_path' => first_page_path,
          'page_path' => page_path
        }
      end

    end
  end
end
