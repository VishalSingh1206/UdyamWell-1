const Video = require('../../../models/videos');
const Course = require('../../../models/courses');
const path = require('path');
const fs = require('fs');

module.exports.createVideo = async function(req,res){
    let course = await Course.findById(req.params.id);
    try{
        await Video.uploadVideo(req,res,function(err){
            if(err){
              console.log("Multer err=====>",err);
            }

            console.log("video",req.body);
            console.log("files",req.files);
    
             const videoName =  req.body.videoName;
             const description = req.body.description;

              let imagePath = req.files.videoThumbnail[0].filename;
              let videoPath =  req.files.video[0].filename;
        
              const video = new Video({
                videoName,
                videoThumbnail: imagePath,
                video:videoPath,
                description,
              });
        
              if(course){
                course.videos.push(video);
                course.save();
              }

              video.save();

              console.log("video saved successfully");
              return res.status(201).send({message:"video saved successfully"});
          })
      }catch(err){
        res.status(500).json({message:"Unable to save video"});
        console.log("Error",err);
        return;
      }
}

module.exports.fetchVideo = async function(req,res){
    try{
         let lectures = await Video.find({});
         return res.status(200).json({
            lectures:lectures
        })
    }catch(err){
        res.status(400).json({message:"Unable to fetch data"});
        console.log(err);
        return;
    }
}

/// needa to work-----------------------------
module.exports.updateVideo = async function(req,res){
    let video = await Video.findById(req.params.id);

    try {
        await Video.uploadVideo(req,res,async function(err){
    
            if (!video) {
              return res.status(404).json({
                message: "Course not found",
              });
            }
        
            // Assuming you have the updated data in the request body
            const updatedData = {
            videoName: req.body.videoName,
            description: req.body.description,
            };
                  // Check if there is a new image file in the request
    if (req.files) {
        // Delete the previous image file from the folder
        if (video.videoThumbnail) {
          const imagePath = path.join(__dirname, '../../../',Video.imagePath, video.videoThumbnail);

          fs.unlinkSync(imagePath);
        }

                    // Update the image path in the updatedData object
                    updatedData.videoThumbnail = req.files.videoThumbnail[0].filename;

        // Delete the previous video file from the folder
        if (video.video) {
          const videoPath = path.join(__dirname, '../../../',Video.videoPath, video.video);
          fs.unlinkSync(videoPath);
        }
               // Update the video path in the updatedData object
                updatedData.video =  req.files.video[0].filename;
      }

            // Update the course document
            await Video.updateOne({ _id: req.params.id }, updatedData);
        
            return res.status(200).json({
              message: "Course updated successfully",
            });
        });
      } catch (err) {
        console.log("****** Error:", err);
        return res.status(500).json({
          message: "Internal Server Error",
        });
    }
}

module.exports.deleteVideo  = async function(req,res){
    try{
        let videos =  await Video.findById(req.params.id);

        // .id means converting the Object id into string
 
        if(videos){
            videos.deleteOne();
        }else{
            return  res.status(400).json({
                message:"Course not found"
            })
        }
            return  res.status(200).json({
                message:"Course and associated videos deleted successfully"
            })

    }catch(err){
        console.log("****** Error:",err);
        return res.status(500).json({
            message:"Internal Server Error"
        });
    }
}