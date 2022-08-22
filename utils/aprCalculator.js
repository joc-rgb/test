export default function aprCalculator(amount, duration, rate) {
  const apr = Number((amount * rate * duration) / 36500);
  const total = +apr + +amount;
  return total.toFixed(10);
}
