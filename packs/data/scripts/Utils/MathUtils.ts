export function subdiviseIntervals(array: Array<number>, slices: number) {
  let newArray: Array<number> = new Array();
  let i: number = 0;
  while (array[i] && array[i + 1]) {
    let delta: number = array[i + 1] - array[i];
    let subInterval: number = delta / slices;
    let p: number = 0;
    while (p != slices - 1) {
      newArray.push(array[i] + (p * subInterval));
      p++;
    }
    i++;
  }
  if (array[i]) {
    newArray.push(array[i]);
  }
  return newArray;

}

//Cas particulier de la rotation y pour prendre en compte le passage -180/0
export function subdiviseIntervalsRotY(array: Array<number>, slices: number) {
  let newArray: Array<number> = new Array();
  let cosArray: Array<number> = new Array();
  let sinArray: Array<number> = new Array();
  for (let i = 0; i < array.length; i++) {
    cosArray[i] = Math.cos((Math.PI * array[i]) / 180);
    sinArray[i] = Math.sin((Math.PI * array[i]) / 180);
  }
  let cosArrayUpdated: Array<number> = subdiviseIntervals(cosArray, slices);
  let sinArrayUpdated: Array<number> = subdiviseIntervals(sinArray, slices);
  for (let i = 0; i < cosArrayUpdated.length; i++) {
    if (cosArrayUpdated[i] === 0) {
      if (sinArrayUpdated[i] === 1) {
        newArray[i] = 90;
      } else {
        newArray[i] = -90;
      }
    } else {
      if (cosArrayUpdated[i] > 0) {
        newArray[i] = (Math.atan(sinArrayUpdated[i] / cosArrayUpdated[i]) * 180) / Math.PI;
      } else {
        newArray[i] = 180 - (Math.atan(-sinArrayUpdated[i] / cosArrayUpdated[i]) * 180) / Math.PI;
      }
    }
  }
  return newArray;

}