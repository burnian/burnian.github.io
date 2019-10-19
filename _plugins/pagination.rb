module Jekyll
  module Paginate
    class Pagination < Generator
      # This generator is safe from arbitrary code execution.
      safe true

      # This generator should be passive with regard to its execution
      priority :lowest

      # Generate paginated pages if necessary.
      #
      # site - The Site.
      #
      # Returns nothing.
      def generate(site)
        paths = site.config['paginate_paths']
        if Pager.pagination_enabled?(site) && !paths.nil?
          paths.each do |path|
            site.config['paginate_path'] = path
            if template = template_page(site)
              paginate(site, template)
            else
              Jekyll.logger.warn "Pagination:", "Pagination is enabled, but I couldn't find " +
              "an index.html page to use as the pagination template. Skipping pagination."
            end
          end
        end
      end

      # Paginates the blog's posts. Renders the index.html file into paginated
      # directories, e.g.: page2/index.html, page3/index.html, etc and adds more
      # site-wide data.
      # 对于index.html 模板文件的复用，不会在config['paginate_paths'] 这个数组中的第一个
      # 路径下创建新的index.html 文件，而是直接利用该模板文件，从第二个路径开始，都会在其下
      # 创建新的index.html 文件。
      #
      # site - The Site.
      # page - The index.html Page that requires pagination.
      #
      # {"paginator" => { "page" => <Number>,
      #                   "per_page" => <Number>,
      #                   "posts" => [<Post>],
      #                   "total_posts" => <Number>,
      #                   "total_pages" => <Number>,
      #                   "previous_page" => <Number>,
      #                   "next_page" => <Number> }}
      def paginate(site, page)
        all_posts = site.site_payload['site']['posts']
        name = site.config['paginate_path'].split('/')[1]
        if !name || name == ":num"
          all_posts = all_posts.reject do |post| post['hidden'] end
        else
          all_posts = all_posts.find_all do |post|
            post['categories'].count(name) > 0 || post['tags'].count(name) > 0
          end
        end

        pages = Pager.calculate_pages(all_posts, site.config['paginate'].to_i)

        for i in 1..pages
          pager = Pager.new(site, i, all_posts, pages)

          if page.pager.nil?
            page.pager = pager
          else
            newpage = Page.new(site, site.source, page.dir, page.name)
            newpage.pager = pager
            # paginate_paths 的配置中有name 时，就应该以该name 为title，若没有name，则使用模板index 的默认title
            if !name.nil? && name != ":num"
              newpage.data['title'] = name
            end
            if i > 1
              newpage.dir = Pager.paginate_path(site, i)
            else
              format = File.dirname(site.config['paginate_path'])
              newpage.dir = Pager.ensure_leading_slash(format)
            end
            site.pages << newpage
          end
        end
      end

      # Static: Fetch the URL of the template page. Used to determine the
      #         path to the first pager in the series.
      #
      # site - the Jekyll::Site object
      #
      # Returns the url of the template page
      def self.first_page_url(site)
        if page = Pagination.new.template_page(site)
          page.url
        else
          nil
        end
      end

      # Public: Find the Jekyll::Page which will act as the pager template
      #
      # site - the Jekyll::Site object
      #
      # Returns the Jekyll::Page which will act as the pager template
      def template_page(site)
        site.pages.dup.select do |page|
          Pager.pagination_candidate?(site.config, page)
        end.sort do |one, two|
          two.path.size <=> one.path.size
        end.first
      end

    end
  end
end
