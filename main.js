const { substrate_getAmountOutPrice } = require("./index");

// Sample addresses from the list
const TOKEN_A = "0xde9816Dd965F905a78134BFEE414Af1412cE39F1";
const TOKEN_B = "0x387bE5Bb1FeCa2079CDB56E6364b3Eb8c1404A4B";
const WALLET_ADDRESS = "0x4Cd136396b26373a4E6380ea7933C7D72D7b75C7";

// Amount of tokens to check (1 token with 18 decimals)
const INPUT_AMOUNT = "1000000000000000000";

async function checkPrice() {
  try {
    console.log("Checking price for swap...");
    console.log("Input Token:", TOKEN_A);
    console.log("Output Token:", TOKEN_B);
    console.log("Amount:", INPUT_AMOUNT);

    const amounts = await substrate_getAmountOutPrice(
      WALLET_ADDRESS,
      INPUT_AMOUNT,
      TOKEN_A,
      TOKEN_B,
    );

    console.log("\nResults:");
    console.log("Input Amount:", amounts[0]);
    console.log("Output Amount:", amounts[1]);
  } catch (error) {
    console.error("Error checking price:", error);
  }
}

// Run the price check
checkPrice()
  .then(() => {
    console.log("\nPrice check completed!");
  })
  .catch((error) => {
    console.error("Fatal error:", error);
  });
