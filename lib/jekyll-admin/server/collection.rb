# frozen_string_literal: true

module JekyllAdmin
  class Server < Sinatra::Base
    namespace "/collections" do
      get do
        json(site.collections.map { |c| c[1].to_api })
      end

      get "/:collection_id" do
        ensure_collection
        json collection.to_api
      end

      get "/:collection_id/*?/?:path.:ext" do
        ensure_requested_file
        json requested_file.to_api(:include_content => true)
      end

      get "/:collection_id/entries/?*" do
        ensure_directory
        json entries.map(&:to_api)
      end

      put "/:collection_id/*?/?:path.:ext" do
        ensure_collection

        if renamed?
          ensure_requested_file
          delete_file path
        end

        write_file write_path, document_body
        delete_file(draft_path) if request_payload["published"]
        ensure_assets_directory

        json written_file.to_api(:include_content => true)
      end

      delete "/:collection_id/*?/?:path.:ext" do
        ensure_requested_file
        delete_file path
        remove_assets_directory
        content_type :json
        status 200
        halt
      end

      private

      def collection
        collection = site.collections.find { |l, _c| l == params["collection_id"] }
        collection[1] if collection
      end

      def document_id
        path = File.join(params["splat"].first, filename)
        path.gsub(%r!(\d{4})/(\d{2})/(\d{2})/(.*)!, '\1-\2-\3-\4')
      end

      def directory_docs
        collection.docs.find_all { |d| File.dirname(d.path) == directory_path }
      end

      def ensure_collection
        render_404 if collection.nil?
      end

      def ensure_directory
        ensure_collection
        render_404 unless Dir.exist?(directory_path)
      end


      def ensure_assets_directory
        unless Dir.exist?(assets_directory_path)
          Dir.mkdir(assets_directory_path)
        end
      end

      def remove_assets_directory
        if Dir.exist?(assets_directory_path)
          FileUtils.rm_rf(assets_directory_path)
        end

      end

      def assets_directory_path
        File.join( site.source, 'assets', 'posts', filename.gsub(/.md$/,'') )
      end



      def entries
        args = {
          :base         => site.source,
          :content_type => params["collection_id"],
          :splat        => params["splat"].first,
        }
        # get the directories inside the requested directory
        directory = JekyllAdmin::Directory.new(directory_path, args)
        directories = directory.directories
        # merge directories with the documents at the same level
        directories.concat(directory_docs.sort_by(&:date).reverse)
      end

      def draft_path
        sanitized_path File.join("_drafts", request_payload["draft_path"])
      end
    end
  end
end
