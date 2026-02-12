// Sample PMS color data (subset of 901 colors)
// In a real application, this would contain all PMS 100-814 colors

export interface PMSColor {
  pms: string;
  series: string;
  hex: string;
  name: string;
  notes: string;
}

export const pmsColors: PMSColor[] = [
  // Coated (C) samples
  { pms: '100', series: 'C', hex: '#F6EB61', name: 'Process Yellow C', notes: 'Pantone Formula Guide' },
  { pms: '101', series: 'C', hex: '#F7ED4E', name: 'Vibrant Yellow C', notes: 'Pantone Formula Guide' },
  { pms: '102', series: 'C', hex: '#FFEC00', name: 'Bright Yellow C', notes: 'Pantone Formula Guide' },
  { pms: '107', series: 'C', hex: '#FFC627', name: 'Golden Yellow C', notes: 'Pantone Formula Guide' },
  { pms: '108', series: 'C', hex: '#FDDA24', name: 'Marigold C', notes: 'Pantone Formula Guide' },
  { pms: '109', series: 'C', hex: '#FFD700', name: 'Golden Rod C', notes: 'Pantone Formula Guide' },
  { pms: '116', series: 'C', hex: '#FFB81C', name: 'Sports Gold C', notes: 'Pantone Formula Guide' },
  { pms: '123', series: 'C', hex: '#FFC72C', name: 'Bright Orange C', notes: 'Pantone Formula Guide' },
  { pms: '137', series: 'C', hex: '#FF8200', name: 'Bright Orange C', notes: 'Pantone Formula Guide' },
  { pms: '144', series: 'C', hex: '#FF9E1B', name: 'Tangerine C', notes: 'Pantone Formula Guide' },
  { pms: '151', series: 'C', hex: '#FF6A13', name: 'Pumpkin C', notes: 'Pantone Formula Guide' },
  { pms: '158', series: 'C', hex: '#FF6A00', name: 'Safety Orange C', notes: 'Pantone Formula Guide' },
  { pms: '165', series: 'C', hex: '#FF5F00', name: 'Tiger Orange C', notes: 'Pantone Formula Guide' },
  { pms: '172', series: 'C', hex: '#FA4616', name: 'Bright Red-Orange C', notes: 'Pantone Formula Guide' },
  { pms: '179', series: 'C', hex: '#E03C31', name: 'Flame C', notes: 'Pantone Formula Guide' },
  { pms: '185', series: 'C', hex: '#E4002B', name: 'Scarlet C', notes: 'Pantone Formula Guide' },
  { pms: '186', series: 'C', hex: '#C8102E', name: 'Red C', notes: 'Pantone Formula Guide' },
  { pms: '187', series: 'C', hex: '#A6192E', name: 'Crimson C', notes: 'Pantone Formula Guide' },
  { pms: '193', series: 'C', hex: '#BF0D3E', name: 'Ruby Red C', notes: 'Pantone Formula Guide' },
  { pms: '200', series: 'C', hex: '#BA0C2F', name: 'Cardinal C', notes: 'Pantone Formula Guide' },
  { pms: '207', series: 'C', hex: '#A51890', name: 'Magenta C', notes: 'Pantone Formula Guide' },
  { pms: '214', series: 'C', hex: '#CF0072', name: 'Cerise C', notes: 'Pantone Formula Guide' },
  { pms: '225', series: 'C', hex: '#F993BC', name: 'Carnation Pink C', notes: 'Pantone Formula Guide' },
  { pms: '226', series: 'C', hex: '#F94A8D', name: 'Hot Pink C', notes: 'Pantone Formula Guide' },
  { pms: '233', series: 'C', hex: '#C724B1', name: 'Purple C', notes: 'Pantone Formula Guide' },
  { pms: '241', series: 'C', hex: '#C724B1', name: 'Bright Violet C', notes: 'Pantone Formula Guide' },
  { pms: '248', series: 'C', hex: '#CE0F69', name: 'Fuchsia C', notes: 'Pantone Formula Guide' },
  { pms: '253', series: 'C', hex: '#8C2F8A', name: 'Violet C', notes: 'Pantone Formula Guide' },
  { pms: '258', series: 'C', hex: '#5F259F', name: 'Royal Purple C', notes: 'Pantone Formula Guide' },
  { pms: '265', series: 'C', hex: '#3E2B85', name: 'Deep Purple C', notes: 'Pantone Formula Guide' },
  { pms: '272', series: 'C', hex: '#582C83', name: 'Plum C', notes: 'Pantone Formula Guide' },
  { pms: '279', series: 'C', hex: '#418FDE', name: 'Sky Blue C', notes: 'Pantone Formula Guide' },
  { pms: '280', series: 'C', hex: '#012169', name: 'Navy Blue C', notes: 'Pantone Formula Guide' },
  { pms: '285', series: 'C', hex: '#0072CE', name: 'Reflex Blue C', notes: 'Pantone Formula Guide' },
  { pms: '286', series: 'C', hex: '#0033A0', name: 'Royal Blue C', notes: 'Pantone Formula Guide' },
  { pms: '287', series: 'C', hex: '#003087', name: 'Dark Blue C', notes: 'Pantone Formula Guide' },
  { pms: '293', series: 'C', hex: '#003DA5', name: 'Medium Blue C', notes: 'Pantone Formula Guide' },
  { pms: '294', series: 'C', hex: '#002F6C', name: 'Sapphire C', notes: 'Pantone Formula Guide' },
  { pms: '300', series: 'C', hex: '#005EB8', name: 'Cobalt Blue C', notes: 'Pantone Formula Guide' },
  { pms: '301', series: 'C', hex: '#004B87', name: 'Ocean Blue C', notes: 'Pantone Formula Guide' },
  { pms: '307', series: 'C', hex: '#006BA6', name: 'Cerulean C', notes: 'Pantone Formula Guide' },
  { pms: '312', series: 'C', hex: '#00B5E2', name: 'Cyan C', notes: 'Pantone Formula Guide' },
  { pms: '313', series: 'C', hex: '#00A9CE', name: 'Turquoise C', notes: 'Pantone Formula Guide' },
  { pms: '320', series: 'C', hex: '#009CA6', name: 'Teal C', notes: 'Pantone Formula Guide' },
  { pms: '321', series: 'C', hex: '#008C95', name: 'Deep Teal C', notes: 'Pantone Formula Guide' },
  { pms: '327', series: 'C', hex: '#00ADC6', name: 'Aqua C', notes: 'Pantone Formula Guide' },
  { pms: '333', series: 'C', hex: '#3EB1C8', name: 'Sea Blue C', notes: 'Pantone Formula Guide' },
  { pms: '334', series: 'C', hex: '#009EAB', name: 'Tropical C', notes: 'Pantone Formula Guide' },
  { pms: '340', series: 'C', hex: '#00A499', name: 'Jade C', notes: 'Pantone Formula Guide' },
  { pms: '341', series: 'C', hex: '#00B388', name: 'Emerald C', notes: 'Pantone Formula Guide' },
  { pms: '347', series: 'C', hex: '#009A44', name: 'Kelly Green C', notes: 'Pantone Formula Guide' },
  { pms: '348', series: 'C', hex: '#00843D', name: 'Shamrock C', notes: 'Pantone Formula Guide' },
  { pms: '354', series: 'C', hex: '#009639', name: 'Grass Green C', notes: 'Pantone Formula Guide' },
  { pms: '355', series: 'C', hex: '#009B3A', name: 'Forest Green C', notes: 'Pantone Formula Guide' },
  { pms: '361', series: 'C', hex: '#43B02A', name: 'Spring Green C', notes: 'Pantone Formula Guide' },
  { pms: '362', series: 'C', hex: '#7AB800', name: 'Lime Green C', notes: 'Pantone Formula Guide' },
  { pms: '368', series: 'C', hex: '#78BE20', name: 'Bright Green C', notes: 'Pantone Formula Guide' },
  { pms: '369', series: 'C', hex: '#64A70B', name: 'Vivid Green C', notes: 'Pantone Formula Guide' },
  { pms: '375', series: 'C', hex: '#97D700', name: 'Electric Green C', notes: 'Pantone Formula Guide' },
  { pms: '376', series: 'C', hex: '#84BD00', name: 'Vibrant Green C', notes: 'Pantone Formula Guide' },
  { pms: '390', series: 'C', hex: '#ADBB39', name: 'Chartreuse C', notes: 'Pantone Formula Guide' },
  { pms: '396', series: 'C', hex: '#D0DF00', name: 'Yellow-Green C', notes: 'Pantone Formula Guide' },
  { pms: '397', series: 'C', hex: '#BACD40', name: 'Citrus C', notes: 'Pantone Formula Guide' },
  { pms: '410', series: 'C', hex: '#BBBCBC', name: 'Cool Gray 6 C', notes: 'Pantone Formula Guide' },
  { pms: '420', series: 'C', hex: '#A7A8AA', name: 'Cool Gray 8 C', notes: 'Pantone Formula Guide' },
  { pms: '430', series: 'C', hex: '#7C878E', name: 'Cool Gray 10 C', notes: 'Pantone Formula Guide' },
  { pms: '440', series: 'C', hex: '#5B6770', name: 'Cool Gray 11 C', notes: 'Pantone Formula Guide' },
  { pms: '462', series: 'C', hex: '#8E7E6A', name: 'Warm Gray 9 C', notes: 'Pantone Formula Guide' },
  { pms: '463', series: 'C', hex: '#7A6855', name: 'Warm Gray 10 C', notes: 'Pantone Formula Guide' },
  { pms: '464', series: 'C', hex: '#6B5C52', name: 'Warm Gray 11 C', notes: 'Pantone Formula Guide' },
  { pms: '485', series: 'C', hex: '#DA291C', name: 'Signal Red C', notes: 'Pantone Formula Guide' },
  { pms: '492', series: 'C', hex: '#7C2529', name: 'Burgundy C', notes: 'Pantone Formula Guide' },
  { pms: '493', series: 'C', hex: '#6A252B', name: 'Maroon C', notes: 'Pantone Formula Guide' },
  { pms: '500', series: 'C', hex: '#004F59', name: 'Dark Teal C', notes: 'Pantone Formula Guide' },
  { pms: '541', series: 'C', hex: '#003C71', name: 'Imperial Blue C', notes: 'Pantone Formula Guide' },
  { pms: '542', series: 'C', hex: '#A0DCEA', name: 'Powder Blue C', notes: 'Pantone Formula Guide' },
  { pms: '5405', series: 'C', hex: '#008C95', name: 'Peacock C', notes: 'Pantone Formula Guide' },
  { pms: '5493', series: 'C', hex: '#00B2A9', name: 'Turquoise Blue C', notes: 'Pantone Formula Guide' },
  { pms: '5498', series: 'C', hex: '#00B7BD', name: 'Bright Turquoise C', notes: 'Pantone Formula Guide' },
  { pms: '5503', series: 'C', hex: '#00A78E', name: 'Tropical Green C', notes: 'Pantone Formula Guide' },
  { pms: '5517', series: 'C', hex: '#00C389', name: 'Mint C', notes: 'Pantone Formula Guide' },
  { pms: '5535', series: 'C', hex: '#00B140', name: 'Irish Green C', notes: 'Pantone Formula Guide' },
  { pms: '5757', series: 'C', hex: '#0E4C3D', name: 'Hunter Green C', notes: 'Pantone Formula Guide' },
  { pms: '5763', series: 'C', hex: '#0D5257', name: 'Pine Green C', notes: 'Pantone Formula Guide' },
  { pms: '662', series: 'C', hex: '#582C83', name: 'Grape C', notes: 'Pantone Formula Guide' },
  { pms: '663', series: 'C', hex: '#AB92BF', name: 'Lavender C', notes: 'Pantone Formula Guide' },
  { pms: '667', series: 'C', hex: '#CEB3D4', name: 'Lilac C', notes: 'Pantone Formula Guide' },
  { pms: '710', series: 'C', hex: '#FF6900', name: 'Persimmon C', notes: 'Pantone Formula Guide' },
  { pms: '711', series: 'C', hex: '#FF8200', name: 'Pumpkin C', notes: 'Pantone Formula Guide' },
  { pms: '712', series: 'C', hex: '#FFD100', name: 'Sunflower C', notes: 'Pantone Formula Guide' },
  { pms: '801', series: 'C', hex: '#009DD9', name: 'Process Cyan C', notes: 'Pantone Formula Guide' },
  { pms: '802', series: 'C', hex: '#44D62C', name: 'Process Green C', notes: 'Pantone Formula Guide' },
  { pms: '803', series: 'C', hex: '#FFD100', name: 'Process Yellow C', notes: 'Pantone Formula Guide' },
  { pms: '804', series: 'C', hex: '#FF6A13', name: 'Process Orange C', notes: 'Pantone Formula Guide' },
  { pms: '805', series: 'C', hex: '#E4002B', name: 'Process Magenta C', notes: 'Pantone Formula Guide' },
  { pms: '806', series: 'C', hex: '#FF1493', name: 'Process Pink C', notes: 'Pantone Formula Guide' },
  { pms: '807', series: 'C', hex: '#00B5E2', name: 'Process Blue C', notes: 'Pantone Formula Guide' },
  { pms: 'Black', series: 'C', hex: '#2D2926', name: 'Black C', notes: 'Pantone Formula Guide' },

  // Uncoated (U) samples
  { pms: '100', series: 'U', hex: '#F4E287', name: 'Process Yellow U', notes: 'Pantone Formula Guide' },
  { pms: '101', series: 'U', hex: '#F5E56B', name: 'Vibrant Yellow U', notes: 'Pantone Formula Guide' },
  { pms: '107', series: 'U', hex: '#FBBC58', name: 'Golden Yellow U', notes: 'Pantone Formula Guide' },
  { pms: '108', series: 'U', hex: '#F7CF47', name: 'Marigold U', notes: 'Pantone Formula Guide' },
  { pms: '116', series: 'U', hex: '#F7A738', name: 'Sports Gold U', notes: 'Pantone Formula Guide' },
  { pms: '123', series: 'U', hex: '#F7B547', name: 'Bright Orange U', notes: 'Pantone Formula Guide' },
  { pms: '151', series: 'U', hex: '#F26C3D', name: 'Pumpkin U', notes: 'Pantone Formula Guide' },
  { pms: '158', series: 'U', hex: '#F26522', name: 'Safety Orange U', notes: 'Pantone Formula Guide' },
  { pms: '165', series: 'U', hex: '#F15F29', name: 'Tiger Orange U', notes: 'Pantone Formula Guide' },
  { pms: '172', series: 'U', hex: '#E84E3D', name: 'Bright Red-Orange U', notes: 'Pantone Formula Guide' },
  { pms: '185', series: 'U', hex: '#DD4B4A', name: 'Scarlet U', notes: 'Pantone Formula Guide' },
  { pms: '186', series: 'U', hex: '#C63952', name: 'Red U', notes: 'Pantone Formula Guide' },
  { pms: '193', series: 'U', hex: '#BC3F63', name: 'Ruby Red U', notes: 'Pantone Formula Guide' },
  { pms: '200', series: 'U', hex: '#B54357', name: 'Cardinal U', notes: 'Pantone Formula Guide' },
  { pms: '207', series: 'U', hex: '#A04A95', name: 'Magenta U', notes: 'Pantone Formula Guide' },
  { pms: '214', series: 'U', hex: '#C94A82', name: 'Cerise U', notes: 'Pantone Formula Guide' },
  { pms: '233', series: 'U', hex: '#BC5BB4', name: 'Purple U', notes: 'Pantone Formula Guide' },
  { pms: '253', series: 'U', hex: '#8A5593', name: 'Violet U', notes: 'Pantone Formula Guide' },
  { pms: '258', series: 'U', hex: '#6E54A3', name: 'Royal Purple U', notes: 'Pantone Formula Guide' },
  { pms: '265', series: 'U', hex: '#534F8F', name: 'Deep Purple U', notes: 'Pantone Formula Guide' },
  { pms: '272', series: 'U', hex: '#6A5494', name: 'Plum U', notes: 'Pantone Formula Guide' },
  { pms: '279', series: 'U', hex: '#6492C6', name: 'Sky Blue U', notes: 'Pantone Formula Guide' },
  { pms: '280', series: 'U', hex: '#2F4F7F', name: 'Navy Blue U', notes: 'Pantone Formula Guide' },
  { pms: '285', series: 'U', hex: '#3D7DC1', name: 'Reflex Blue U', notes: 'Pantone Formula Guide' },
  { pms: '286', series: 'U', hex: '#2E5FA8', name: 'Royal Blue U', notes: 'Pantone Formula Guide' },
  { pms: '287', series: 'U', hex: '#26539A', name: 'Dark Blue U', notes: 'Pantone Formula Guide' },
  { pms: '300', series: 'U', hex: '#3773B8', name: 'Cobalt Blue U', notes: 'Pantone Formula Guide' },
  { pms: '301', series: 'U', hex: '#2D6099', name: 'Ocean Blue U', notes: 'Pantone Formula Guide' },
  { pms: '312', series: 'U', hex: '#4EADD3', name: 'Cyan U', notes: 'Pantone Formula Guide' },
  { pms: '313', series: 'U', hex: '#4FA4C4', name: 'Turquoise U', notes: 'Pantone Formula Guide' },
  { pms: '320', series: 'U', hex: '#3D9BA7', name: 'Teal U', notes: 'Pantone Formula Guide' },
  { pms: '321', series: 'U', hex: '#3A898F', name: 'Deep Teal U', notes: 'Pantone Formula Guide' },
  { pms: '327', series: 'U', hex: '#42A6BB', name: 'Aqua U', notes: 'Pantone Formula Guide' },
  { pms: '340', series: 'U', hex: '#389F96', name: 'Jade U', notes: 'Pantone Formula Guide' },
  { pms: '347', series: 'U', hex: '#3D9164', name: 'Kelly Green U', notes: 'Pantone Formula Guide' },
  { pms: '348', series: 'U', hex: '#377F5F', name: 'Shamrock U', notes: 'Pantone Formula Guide' },
  { pms: '354', series: 'U', hex: '#3D8E5A', name: 'Grass Green U', notes: 'Pantone Formula Guide' },
  { pms: '355', series: 'U', hex: '#3E8E58', name: 'Forest Green U', notes: 'Pantone Formula Guide' },
  { pms: '361', series: 'U', hex: '#6AA84F', name: 'Spring Green U', notes: 'Pantone Formula Guide' },
  { pms: '368', series: 'U', hex: '#85B845', name: 'Bright Green U', notes: 'Pantone Formula Guide' },
  { pms: '375', series: 'U', hex: '#A0CE4E', name: 'Electric Green U', notes: 'Pantone Formula Guide' },
  { pms: '376', series: 'U', hex: '#93B746', name: 'Vibrant Green U', notes: 'Pantone Formula Guide' },
  { pms: '485', series: 'U', hex: '#D24C44', name: 'Signal Red U', notes: 'Pantone Formula Guide' },
  { pms: '492', series: 'U', hex: '#7A4049', name: 'Burgundy U', notes: 'Pantone Formula Guide' },
  { pms: 'Black', series: 'U', hex: '#413F42', name: 'Black U', notes: 'Pantone Formula Guide' },
];

// Calculate Euclidean distance in RGB color space
function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16),
      }
    : null;
}

function calculateDistance(hex1: string, hex2: string): number {
  const rgb1 = hexToRgb(hex1);
  const rgb2 = hexToRgb(hex2);

  if (!rgb1 || !rgb2) return Infinity;

  const rDiff = rgb1.r - rgb2.r;
  const gDiff = rgb1.g - rgb2.g;
  const bDiff = rgb1.b - rgb2.b;

  return Math.sqrt(rDiff * rDiff + gDiff * gDiff + bDiff * bDiff);
}

export function findClosestMatches(
  inputHex: string,
  series: string,
  limit: number
): Array<PMSColor & { distance: number }> {
  // Filter by series
  let filteredColors = pmsColors;
  if (series === 'Coated (C)') {
    filteredColors = pmsColors.filter((c) => c.series === 'C');
  } else if (series === 'Uncoated (U)') {
    filteredColors = pmsColors.filter((c) => c.series === 'U');
  }

  // Calculate distances
  const withDistances = filteredColors.map((color) => ({
    ...color,
    distance: calculateDistance(inputHex, color.hex),
  }));

  // Sort by distance and return top matches
  return withDistances.sort((a, b) => a.distance - b.distance).slice(0, limit);
}
