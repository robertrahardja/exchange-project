import { ethers } from "ethers";
import { cropData } from "../../utils/math";

const CHAIN_RPC_URL = {
  development: "http://127.0.0.1:7545", // Local Ganache instance
};

// Exchange contract ABI - add your actual ABI here
const EXCHANGE_ABI = [
  "function getAmountOutPrice(uint256 supply, uint256[] calldata path) external view returns (uint256[] memory)",
  "function getAmountInPrice(uint256 supply, uint256[] calldata path) external view returns (uint256[] memory)",
  "function getEstimateLpToken(uint256 token0, uint256 amount0, uint256 token1, uint256 amount1) external view returns (uint256)",
  "function getEstimateOutToken(uint256 supply, uint256 token0, uint256 token1) external view returns (uint256)",
  "function swapExactTokensForTokens(uint256 amountIn, uint256 amountOutMin, uint256[] calldata path, address to, uint256 deadline) external returns (uint256[] memory amounts)",
];

// Replace with your actual contract address
// const EXCHANGE_CONTRACT_ADDRESS = "YOUR_EXCHANGE_CONTRACT_ADDRESS";
const EXCHANGE_CONTRACT_ADDRESS = "0xdEF4BfeC8D2CB5ABE56E6D54665dDF78445D7112";

const getProvider = () => {
  return new ethers.JsonRpcProvider(CHAIN_RPC_URL);
};

const getExchangeContract = (signerOrProvider) => {
  return new ethers.Contract(
    EXCHANGE_CONTRACT_ADDRESS,
    EXCHANGE_ABI,
    signerOrProvider,
  );
};

export const chain_api = async (address) => {
  const provider = getProvider();
  const signer = provider.getSigner(address);
  return getExchangeContract(signer);
};

export const substrate_wallet_injector = async (address) => {
  const provider = getProvider();
  return provider.getSigner(address);
};

export const substrate_getAmountOutPrice = async (
  intactWalletAddress,
  tokenNumber,
  poolA,
  poolB,
) => {
  try {
    const contract = getExchangeContract(getProvider());
    const amounts = await contract.getAmountOutPrice(BigInt(tokenNumber), [
      BigInt(poolA),
      BigInt(poolB),
    ]);
    return amounts.map((amount) => amount.toString());
  } catch (error) {
    console.error("Error getting amount out price:", error);
    throw error;
  }
};

export const substrate_EstimateOutToken = async (
  intactWalletAddress,
  inputNumber,
  tokenAId,
  tokenBId,
) => {
  try {
    const contract = getExchangeContract(getProvider());
    const estimatedAmount = await contract.getEstimateOutToken(
      BigInt(inputNumber),
      BigInt(tokenAId),
      BigInt(tokenBId),
    );
    return estimatedAmount.toString();
  } catch (error) {
    console.error("Error estimating out token:", error);
    throw error;
  }
};

export const substrate_getEstimateLpToken = async (
  intactWalletAddress,
  tokenA,
  amountA,
  tokenB,
  amountB,
) => {
  try {
    const contract = getExchangeContract(getProvider());
    const estimatedLp = await contract.getEstimateLpToken(
      BigInt(tokenA),
      BigInt(amountA),
      BigInt(tokenB),
      BigInt(amountB),
    );

    // Convert to human readable format
    const lpAmount = ethers.formatUnits(estimatedLp, 18);
    return cropData(parseFloat(lpAmount), 5).toString();
  } catch (error) {
    console.error("Error estimating LP tokens:", error);
    throw error;
  }
};
