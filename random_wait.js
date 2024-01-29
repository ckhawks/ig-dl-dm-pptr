function randn_bm(min, max, skew) {
  let u = 0,
    v = 0;
  while (u === 0) u = Math.random(); //Converting [0,1) to (0,1)
  while (v === 0) v = Math.random();
  let num = Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);

  num = num / 10.0 + 0.5; // Translate to 0 -> 1
  if (num > 1 || num < 0)
    num = randn_bm(min, max, skew); // resample between 0 and 1 if out of range
  else {
    num = Math.pow(num, skew); // Skew
    num *= max - min; // Stretch to fill range
    num += min; // offset to min
  }
  return num;
}
// https://stackoverflow.com/questions/25582882/javascript-math-random-normal-distribution-gaussian-bell-curve

async function wait_randomly(ms, floor = 0) {
  let min = ms * 0.5;
  if (floor > min) {
    min = floor;
  }
  const max = ms * 1.5;
  // console.log(min, max);
  const delay = randn_bm(min, max, 1.0);
  // console.log(`waiting for ${delay} ms`);
  return new Promise((resolve) => setTimeout(resolve, delay));
}

// -- will was here

export default wait_randomly;
