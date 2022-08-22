export default function collateralReformat(collateral) {
  console.log("Collateral: ", collateral);
  const addr = collateral.slice(0, 42);
  const tokenId = collateral.slice(43);
  return { addr, tokenId };
}
