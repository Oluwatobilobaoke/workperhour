const urls = [];
const files = req.files;
for (const file of files) {
  const { path } = file;
  const newPath = await cloudinaryImageUploadMethod(path)
  urls.push(newPath)
  console.log(urls)
}
  req.body.image = urls.map( url => url.res )