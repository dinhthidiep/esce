using Microsoft.AspNetCore.Http;

namespace ESCE_SYSTEM.Services.FileService
{
    public interface IFileService
    {
        Task<string> UploadFileAsync(IFormFile file, string folder = "images");
        Task<bool> DeleteFileAsync(string filePath);
    }
}

