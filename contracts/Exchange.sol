// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

interface IERC20 {
    function transferFrom(address sender, address recipient, uint256 amount) external returns (bool);
    function transfer(address recipient, uint256 amount) external returns (bool);
    function balanceOf(address account) external view returns (uint256);
}

contract Exchange {
    bool private locked;

    event TokenSwap(
        address indexed user,
        address[] path,
        uint256[] amounts
    );
    
    event LiquidityAdded(
        address indexed provider,
        address token0,
        uint256 amount0,
        address token1,
        uint256 amount1,
        uint256 lpTokens
    );

    modifier noReentrant() {
        require(!locked, "Reentrant call");
        locked = true;
        _;
        locked = false;
    }

    function _getAmountOutPrice(uint256 supply, address[] memory path) 
        internal 
        pure 
        returns (uint256[] memory)
    {
        require(path.length >= 2, "Invalid path");
        
        uint256[] memory amounts = new uint256[](path.length);
        amounts[0] = supply;
        
        for (uint256 i = 0; i < path.length - 1; i++) {
            amounts[i + 1] = calculateOutputAmount(amounts[i]);
        }
        
        return amounts;
    }

    function getAmountOutPrice(uint256 supply, address[] calldata path) 
        external 
        pure 
        returns (uint256[] memory)
    {
        return _getAmountOutPrice(supply, path);
    }
    
    function getAmountInPrice(uint256 supply, address[] calldata path)
        external
        pure
        returns (uint256[] memory)
    {
        require(path.length >= 2, "Invalid path");
        
        uint256[] memory amounts = new uint256[](path.length);
        amounts[path.length - 1] = supply;
        
        for (uint256 i = path.length - 1; i > 0; i--) {
            amounts[i - 1] = calculateInputAmount(amounts[i]);
        }
        
        return amounts;
    }
    
    function getEstimateLpToken(
        address token0,
        uint256 amount0,
        address token1,
        uint256 amount1
    ) external pure returns (uint256) {
        require(token0 != token1, "Identical tokens");
        require(amount0 > 0 && amount1 > 0, "Invalid amount");
        
        return sqrt(amount0 * amount1);
    }
    
    function getEstimateOutToken(
        uint256 supply,
        address token0,
        address token1
    ) external view returns (uint256) {
        require(token0 != token1, "Identical tokens");
        require(supply > 0, "Invalid amount");
        
        uint256 balance0 = IERC20(token0).balanceOf(address(this));
        uint256 balance1 = IERC20(token1).balanceOf(address(this));
        
        return (supply * balance1) / balance0;
    }
    
    function swapExactTokensForTokens(
        uint256 amountIn,
        uint256 amountOutMin,
        address[] calldata path,
        address to,
        uint256 deadline
    ) external noReentrant returns (uint256[] memory amounts) {
        require(block.timestamp <= deadline, "Deadline expired");
        require(path.length >= 2, "Invalid path");
        
        amounts = _getAmountOutPrice(amountIn, path);
        require(amounts[amounts.length - 1] >= amountOutMin, "Insufficient output amount");
        
        require(IERC20(path[0]).transferFrom(
            msg.sender,
            address(this),
            amounts[0]
        ), "Transfer failed");
        
        _swap(amounts, path, to);
        
        emit TokenSwap(msg.sender, path, amounts);
        return amounts;
    }
    
    function calculateOutputAmount(uint256 inputAmount) internal pure returns (uint256) {
        return (inputAmount * 997) / 1000;  // 0.3% fee
    }
    
    function calculateInputAmount(uint256 outputAmount) internal pure returns (uint256) {
        return (outputAmount * 1000) / 997;  // 0.3% fee
    }
    
    function _swap(
        uint256[] memory amounts,
        address[] memory path,
        address to
    ) internal {
        for (uint256 i = 0; i < path.length - 1; i++) {
            require(IERC20(path[i + 1]).transfer(to, amounts[i + 1]), "Transfer failed");
        }
    }

    function sqrt(uint256 x) internal pure returns (uint256 y) {
        uint256 z = (x + 1) / 2;
        y = x;
        while (z < y) {
            y = z;
            z = (x / z + z) / 2;
        }
    }
}
