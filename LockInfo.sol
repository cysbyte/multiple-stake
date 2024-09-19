contract LockToken is Ownable, MinterRole{

    
    struct LockInfo{
        uint256 lockBalance;
        uint256 lockTimestamp;
        uint256 withdrawStatus;
    }

    address private erc20_address;

    ERC20 private erc20_interface;

    mapping(address => uint256) addressIndex;

    mapping(address => mapping(uint256 => LockInfo)) lockMap;


    function lock(address lockAddress,uint256[] memory timestamps,uint256[] memory balances) public onlyMinter{
        require(timestamps.length == balances.length,"size error!!");
        uint256 allBalance = 0;
        for(uint256 j =0;j<balances.length;j++){
            allBalance = allBalance + balances[j];
        }
        require(allBalance>0,"lock balance must bigger than zero!!");
        erc20_interface.transferFrom(msg.sender,address(this),allBalance);
        uint256 first = addressIndex[lockAddress];
        for(uint256 i =0;i<timestamps.length;i++){
            uint256 timestamp = timestamps[i];
            uint256 balance = balances[i];
            LockInfo memory newLockInfo;
            newLockInfo.lockBalance = balance;
            newLockInfo.lockTimestamp = timestamp;
            newLockInfo.withdrawStatus = 0;
            lockMap[lockAddress][first] = newLockInfo;
            first = first + 1; 
        }
        addressIndex[lockAddress] = first;
    }

    function withdraw(uint256 index) public {
        require(lockMap[msg.sender][index].lockBalance > 0,"no lock balance!!");
        require(lockMap[msg.sender][index].lockTimestamp < block.timestamp,"still lock!!");
        require(lockMap[msg.sender][index].withdrawStatus == 0,"already withdraw!!");
        erc20_interface.transfer(msg.sender,lockMap[msg.sender][index].lockBalance);
        lockMap[msg.sender][index].withdrawStatus = 1;
    }

    function getLockInfo(address lockAddress,uint256 index) public view returns(LockInfo memory){
        return lockMap[lockAddress][index];
    }

    function getIndex(address lockAddress) public view returns(uint256){
        return addressIndex[lockAddress];
    }

    constructor(address _erc20_address) Ownable(msg.sender){
        erc20_address = _erc20_address;
        erc20_interface = ERC20(_erc20_address);
    }
}