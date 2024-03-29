import { v2 as cloudInary } from 'cloudinary';
import fs from 'fs';


// Cloudinary config
// console.log(process.env.CLOUDINARY_CLOUD_NAME);
// console.log(process.env.CLOUDINARY_CLOUD_API_KEY);
// console.log(process.env.CLOUDINARY_CLOUD_API_SECRET);

cloudInary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_CLOUD_API_KEY,
    api_secret: process.env.CLOUDINARY_CLOUD_API_SECRET
});


// method to upload files on cloudinary
const uploadOnCloudinary = async (localFilePath) => {
    try {
        
        // if theres no file in local storage || unable to get local file path for some reason
        if (!localFilePath || !fs.existsSync(localFilePath)) {
            console.log("File not found : ", localFilePath);
            return null;
        }


        // upload the file on cloudinary
        const fileUploadResponse = await cloudInary.uploader.upload(
            localFilePath, { resource_type: 'auto' }
        );

        // after uploading file on cloudinary remove the file from local
        fs.unlinkSync(localFilePath);
        return fileUploadResponse;

    } catch (error) {
        // removes the locally uploaded file in temp folder after the upload operation got faild.
        console.error('Error uploading to Cloudinary:', error);
        if (localFilePath) {
            fs.unlinkSync(localFilePath);
        }
        return null;
    }
}


export { uploadOnCloudinary }