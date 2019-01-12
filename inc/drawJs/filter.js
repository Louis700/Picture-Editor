"use strict";

function filterImageData(imgData, filterType) {
	switch(filterType) {
		case FilterType.NEGATIVE:
			return mapImageData(imgData, pixelNegativeFilter);

		case FilterType.BLACK_AND_WHITE1:
			return mapImageData(imgData, pixelBlackAndWhite1);

		case FilterType.BLACK_AND_WHITE2:
			return mapImageData(imgData, pixelBlackAndWhite2);

		case FilterType.BLACK_AND_WHITE3:
			return mapImageData(imgData, pixelBlackAndWhite3);

		case FilterType.BLACK_AND_WHITE4:
			return mapImageData(imgData, pixelBlackAndWhite4);

		case FilterType.BLACK_AND_WHITE_CEIL:
			return mapImageData(imgData, pixelBlackAndWhiteCeil);

		case FilterType.COLOR_CEIL:
			return mapImageData(imgData, pixelColorCeil);

		case FilterType.SEPIA:
			return mapImageData(imgData, pixelColorSepia);

		case FilterType.MONOCHROME:
			return mapImageData(imgData, (pixel) => pixelMonochrome(pixel, new Color(52, 52, 255))); // TODO: to link to an element of the DOM

		case FilterType.PIXELATED:
			return pixelate(imgData);

		default:
			return error("The filterType is undefined", imgData);
	}
}

function pixelNegativeFilter(pixel) {
	pixel.r = 255 - pixel.r;
	pixel.g = 255 - pixel.g;
	pixel.b = 255 - pixel.b;

	return pixel;
}

function pixelBlackAndWhite1(pixel) {
	pixel.r = pixel.g = pixel.b = 0.299*pixel.r + 0.587*pixel.g + 0.114*pixel.b;
	return pixel;
}

function pixelBlackAndWhite2(pixel) {
	pixel.r = pixel.g = pixel.b = 0.2126*pixel.r + 0.7152*pixel.g + 0.0722*pixel.b;
	return pixel;
}

function pixelBlackAndWhite3(pixel) {
	pixel.r = pixel.g = pixel.b = (pixel.r + pixel.g + pixel.b)/3
	return pixel;
}

function pixelBlackAndWhite4(pixel) {
	pixel.r = pixel.g = pixel.b = ( Math.max(pixel.r, pixel.g, pixel.b) - Math.min(pixel.r, pixel.g, pixel.b) )/2
	return pixel;
}

function pixelBlackAndWhiteCeil(pixel) {
	return pixelColorCeil( pixelBlackAndWhite1(pixel) );
}

function pixelColorCeil(pixel) {
	pixel.r = (pixel.r < 128) ? 0 : 255;
	pixel.g = (pixel.g < 128) ? 0 : 255;
	pixel.b = (pixel.b < 128) ? 0 : 255;

	return pixel;
}

function pixelColorSepia(pixel) {
	return pixelMonochrome(pixel, new Color(94, 38, 18));
}

function pixelMonochrome(pixel, color) {
	let gray = pixelBlackAndWhite1(pixel).r;

	if(gray < 128) {
		pixel.r = color.r*gray/128;
		pixel.g = color.g*gray/128;
		pixel.b = color.b*gray/128;
	} else {
		pixel.r = color.r + (255 - color.r)*(gray - 128)/128;
		pixel.g = color.g + (255 - color.g)*(gray - 128)/128;
		pixel.b = color.b + (255 - color.b)*(gray - 128)/128;
	}

	return pixel;
}

function pixelate(imgData) {
	for(let x = 0; x < imgData.width - imgData.width%10; x += 10) {
		for(let y = 0; y < imgData.height - imgData.height%10; y += 10) {
			smoothImageDataRect(imgData, x, y, 10, 10);
		}
	}

	if(imgData.width%10 !== 0) {
		for(let y = 0; y < (imgData.height - imgData.height%10); y += 10) {
			smoothImageDataRect(imgData, (imgData.width - imgData.width%10), y, imgData.width%10, 10);
		}
	}

	if(imgData.height%10 !== 0) {
		for(let x = 0; x < (imgData.width - imgData.width%10); x += 10) {
			smoothImageDataRect(imgData, x, (imgData.height - imgData.height%10), 10, imgData.height%10);
		}
	}

	if(imgData.width%10 !== 0 && imgData.height%10 !== 0)
		smoothImageDataRect(imgData, (imgData.width - imgData.width%10), (imgData.height - imgData.height%10), imgData.width%10, imgData.height%10);

	return imgData;
}

// Fill the area with the average color
function smoothImageDataRect(imgData, posX, posY, width, height) {
	if( ( posX < 0 || posX + width > imgData.width ) ||
	    ( posY < 0 || posY + height > imgData.height ) )
		return error("The position and the dimensions precised don't match with imgData's dimensions.", imgData);

	let pixelSum = new Color(0);

	foreachImageDataRect( posX, posY, width, height, imgData, (pixel) => { pixelSum.add(pixel) } );

	let averagePixel = Color.divide(pixelSum, height*width);

	mapImageDataRect(posX, posY, width, height, imgData, () => averagePixel)

	return imgData
}
