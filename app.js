const Jimp = require('jimp');
const inquirer = require('inquirer');
const fs = require('fs');

try {
  const addTextWatermarkToImage = async function (inputFile, outputFile, text, filterType) {
    console.log(filterType);
    const image = await Jimp.read(inputFile);
    const font = await Jimp.loadFont(Jimp.FONT_SANS_32_BLACK);
    const textData = {
      text,
      alignmentX: Jimp.HORIZONTAL_ALIGN_CENTER,
      alignmentY: Jimp.VERTICAL_ALIGN_MIDDLE,
    };

    
    if(filterType === 'make image brightner') {
      image.brightness(0.2);
    } else if(filterType === 'increase contrast') {
      image.contrast(0.2);
    } else if(filterType === 'make image b&w') {
      image.greyscale();
    } else if(filterType === 'invert image') {
      image.invert();
    }
    
    image.print(font, 10, 10, textData, image.getWidth(), image.getHeight());
    
    await image.quality(100).writeAsync(outputFile);
    console.log('Text watermark added to image');
    startApp();
  };
  
  const addImageWatermarkToImage = async function (inputFile, outputFile, watermarkFile, filterType) {
    const image = await Jimp.read(inputFile);
    const watermark = await Jimp.read(watermarkFile);
    const x = image.getWidth() / 2 - watermark.getWidth() / 2;
    const y = image.getHeight() / 2 - watermark.getHeight() / 2;
    console.log(filterType);
    if(filterType === 'make image brightner') {
      image.brightness(0.2);
    } else if(filterType === 'increase contrast') {
      image.contrast(0.2);
    } else if(filterType === 'make image b&w') {
      image.greyscale();
    } else if(filterType === 'invert image') {
      image.invert();
    }

    image.composite(watermark, x, y, {
      mode: Jimp.BLEND_SOURCE_OVER,
      opacitySource: 0.5,
    });

    await image.quality(100).writeAsync(outputFile);
    console.log('Watermark added to image');
    startApp();
  };

  
  const prepareOutputFilename = (fiileName) => {
    const [name, ext] = fiileName.split('.');
    return `${name}-with-watermark.${ext}`;
  }
  
  const startApp = async () => {
  
    // Ask if user is ready
    const answer = await inquirer.prompt([{
      name:'start',
      message: 'Hi! Welcome to "Watermark manager". Copy your image files to `/img` folder. Then you\'ll be able to use them in the app. Are you ready?',
      type: 'confirm'
    }]);
  
    // if answer is no, just quit the app
    if (!answer.start) {
      console.log('Goodbye!');
      process.exit();
    }
  
    // Ask about input file and watermark type
  
    const options = await inquirer.prompt([{
      name: 'inputImage',
      type: 'input',
      message: 'What file do you want to mark?',
      default: 'test.jpg',
    }, {
      name: 'watermarkType',
      type: 'list',
      choices: ['Text watermark', 'Image watermark'],
    }, {
      name: 'filter',
      message: 'Do you want to apply any filter?',
      type: 'confirm',
    }
    ]);
    
    if(options.filter){
      const filter = await inquirer.prompt([{
        name: 'filterType',
        type: 'list',
        message: 'Choose filter type:',
        choices: ['make image brightner', 'increase contrast', 'make image b&w', 'invert image'],
      }]);
      options.filter = filter;
    } else {
      options.filter = {filterType: 'none'};
    }
  
    if (options.watermarkType === 'Text watermark') {
      const text = await inquirer.prompt([{
        name: 'value',
        type: 'input',
        message: 'Type your watermark text:',
      }]);
      options.watermarkText = text.value;
      if(fs.existsSync('./img/' + options.inputImage))
        addTextWatermarkToImage('./img/' + options.inputImage, './img/' + prepareOutputFilename(options.inputImage), options.watermarkText, options.filter.filterType);
      else {
        console.log('Something went wrong... Try again!');
        startApp();
      }
    } 
    else {
      const image = await inquirer.prompt([{
        name: 'filename',
        type: 'input',
        message: 'Type your watermark name:',
        default: 'logo.png',
      }])
      options.watermarkImage = image.filename;
      if(fs.existsSync('./img/' + options.inputImage) && fs.existsSync('./img/' + options.watermarkImage))
        addImageWatermarkToImage('./img/' + options.inputImage, './img/' + prepareOutputFilename(options.inputImage), './img/' + options.watermarkImage, options.filter.filterType);
      else {
        console.log('Something went wrong... Try again!');
        startApp();
      }
    }
  };

  startApp();
} catch (error) {
  console.log('Something went wrong... Try again!')
}
