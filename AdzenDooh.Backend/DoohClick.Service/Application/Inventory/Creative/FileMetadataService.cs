using MetadataExtractor;
using MetadataExtractor.Formats.Exif;
using MetadataExtractor.Formats.Jpeg;
using MetadataExtractor.Formats.Png;
using Xabe.FFmpeg;
using Directory = System.IO.Directory;

namespace AdzenDooh.Service.Application.Inventory.Creative
{
    public class FileMetadata
    {
        public string? Resolution    { get; set; }  
        public string Orientation    { get; set; } = "landscape";
        public int? DurationSecond   { get; set; }
        public bool IsVideo          { get; set; }
        public required string Extension      { get; set; } 
    }

    public interface IFileMetadataService
    {
        Task<FileMetadata> ExtractAsync(string filePath, string extension);
    }

    public class FileMetadataService : IFileMetadataService
    {
        private static readonly HashSet<string> VideoExtensions =
            new(StringComparer.OrdinalIgnoreCase) { ".mp4", ".mov", ".avi", ".mkv", ".webm", ".wmv" };

        private static readonly HashSet<string> ImageExtensions =
            new(StringComparer.OrdinalIgnoreCase) { ".jpg", ".jpeg", ".png", ".gif", ".bmp", ".webp", ".tiff" };

        public async Task<FileMetadata> ExtractAsync(string filePath, string extension)
        {
            var ext = extension.StartsWith('.') ? extension : $".{extension}";

            if (VideoExtensions.Contains(ext))
                return await ExtractVideoMetadata(filePath, ext);

            if (ImageExtensions.Contains(ext))
                return ExtractImageMetadata(filePath, ext);

            // Unknown type — minimal metadata
            return new FileMetadata { Extension = ext.TrimStart('.'), IsVideo = false };
        }

        // ── IMAGE ─────────────────────────────────────────────────────────────
        private FileMetadata ExtractImageMetadata(string filePath, string ext)
        {
            int width = 0, height = 0;

            try
            {
                var directories = ImageMetadataReader.ReadMetadata(filePath);

                // JPEG
                var jpegDir = directories.OfType<JpegDirectory>().FirstOrDefault();
                if (jpegDir != null)
                {
                    width = jpegDir.GetImageWidth();
                    height = jpegDir.GetImageHeight();
                }

                // PNG
                if (width == 0)
                {
                    var pngDir = directories.OfType<PngDirectory>().FirstOrDefault();
                    if (pngDir != null)
                    {
                        pngDir.TryGetInt32(PngDirectory.TagImageWidth, out width);
                        pngDir.TryGetInt32(PngDirectory.TagImageHeight, out height);
                    }
                }

                // EXIF fallback
                if (width == 0)
                {
                    var exifDir = directories.OfType<ExifIfd0Directory>().FirstOrDefault();
                    if (exifDir != null)
                    {
                        exifDir.TryGetInt32(ExifDirectoryBase.TagImageWidth, out width);
                        exifDir.TryGetInt32(ExifDirectoryBase.TagImageHeight, out height);
                    }
                }
            }
            catch
            { }

            string? resolution  = (width > 0 && height > 0) ? $"{width}x{height}" : null;
            string orientation  = (height > width) ? "portrait" : "landscape";

            return new FileMetadata
            {
                Resolution     = resolution,
                Orientation    = orientation,
                IsVideo        = false,
                Extension      = ext.TrimStart('.')
            };
        }

        // ── VIDEO ----------------------------------------------------
        private async Task<FileMetadata> ExtractVideoMetadata(string filePath, string ext)
        {
            try
            {
                var mediaInfo = await FFmpeg.GetMediaInfo(filePath);

                var videoStream = mediaInfo.VideoStreams.FirstOrDefault();
                int width       = videoStream?.Width  ?? 0;
                int height      = videoStream?.Height ?? 0;
                int duration    = (int)Math.Ceiling(mediaInfo.Duration.TotalSeconds);

                string? resolution = (width > 0 && height > 0) ? $"{width}x{height}" : null;
                string orientation = (height > width) ? "portrait" : "landscape";

                return new FileMetadata
                {
                    Resolution     = resolution,
                    Orientation    = orientation,
                    DurationSecond = duration > 0 ? duration : null,
                    IsVideo        = true,
                    Extension      = ext.TrimStart('.')
                };
            }
            catch
            {
                return new FileMetadata
                {
                    IsVideo   = true,
                    Extension = ext.TrimStart('.')
                };
            }
        }

      
    }
}