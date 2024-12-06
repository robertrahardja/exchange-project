const {
  chain_api,
  substrate_wallet_injector,
  substrate_getAmountOutPrice,
  substrate_EstimateOutToken,
  substrate_getEstimateLpToken,
} = require("./index.js");

// Test addresses
const ADDRESSES = [
  "0xde9816Dd965F905a78134BFEE414Af1412cE39F1",
  "0x387bE5Bb1FeCa2079CDB56E6364b3Eb8c1404A4B",
  "0x4Cd136396b26373a4E6380ea7933C7D72D7b75C7",
  "0x348E6d0f056A464ACC674DdcC83F577A0ee731C1",
  "0x80475f4F1cE636Df2a34bF647c98bEc0AFFb63d6",
];

// Test amounts (in wei)
const TEST_AMOUNTS = [
  "1000000000000000000", // 1 token
  "500000000000000000", // 0.5 token
  "2000000000000000000", // 2 tokens
];

async function testContractInteractions() {
  try {
    console.log("\n=== Testing Contract Setup ===");
    // Test provider and contract setup
    const contract = await chain_api(ADDRESSES[0]);
    console.log("Contract initialized at:", contract.target);

    console.log("\n=== Testing Wallet Injection ===");
    // Test wallet injection
    const signer = await substrate_wallet_injector(ADDRESSES[0]);
    console.log("Signer address:", await signer.getAddress());

    console.log("\n=== Testing Price Calculations ===");
    // Test price calculations with different token pairs
    for (let i = 0; i < 2; i++) {
      const tokenA = ADDRESSES[i];
      const tokenB = ADDRESSES[i + 1];
      const amount = TEST_AMOUNTS[i];

      console.log(`\nTest case ${i + 1}:`);
      console.log("Token A:", tokenA);
      console.log("Token B:", tokenB);
      console.log("Amount:", amount);

      // Test getAmountOutPrice
      console.log("\nTesting getAmountOutPrice:");
      const outPrices = await substrate_getAmountOutPrice(
        ADDRESSES[0],
        amount,
        tokenA,
        tokenB,
      );
      console.log("Input Amount:", outPrices[0]);
      console.log("Output Amount:", outPrices[1]);

      // Test EstimateOutToken
      console.log("\nTesting EstimateOutToken:");
      const estimatedOut = await substrate_EstimateOutToken(
        ADDRESSES[0],
        amount,
        tokenA,
        tokenB,
      );
      console.log("Estimated Output:", estimatedOut);
    }

    console.log("\n=== Testing LP Token Estimation ===");
    // Test LP token estimation with different amounts
    const lpTest = await substrate_getEstimateLpToken(
      ADDRESSES[0],
      ADDRESSES[1],
      TEST_AMOUNTS[0],
      ADDRESSES[2],
      TEST_AMOUNTS[1],
    );
    console.log("Estimated LP Tokens for asymmetric provision:", lpTest);

    const lpTestSymmetric = await substrate_getEstimateLpToken(
      ADDRESSES[0],
      ADDRESSES[1],
      TEST_AMOUNTS[0],
      ADDRESSES[2],
      TEST_AMOUNTS[0],
    );
    console.log(
      "Estimated LP Tokens for symmetric provision:",
      lpTestSymmetric,
    );
  } catch (error) {
    console.error("\nError during testing:", error);
    console.error("Error details:", error.message);
    if (error.data) {
      console.error("Contract error data:", error.data);
    }
  }
}

console.log("Starting comprehensive contract tests...");

testContractInteractions()
  .then(() => console.log("\nAll tests completed successfully!"))
  .catch((error) => {
    console.error("\nFatal error in test execution:", error);
    process.exit(1);
  });
