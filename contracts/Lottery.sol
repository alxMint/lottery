// SPDX-Licence-Identifie: MIT

pragma solidity ^0.8.26;


contract Lottery
{
   address public manager;
   address payable[] public players;
   address public lastWinner;

    constructor() 
    {
        manager = msg.sender;
    }


   function enter() public payable
   {
       require(msg.value > .01 ether);
       players.push(payable(msg.sender));
   }

   function random() public view returns (uint) 
   {
       return uint(keccak256(abi.encodePacked(block.difficulty, block.timestamp, players)));
   }


   function pickWinner() public restricted
   {
       // solo il manager può invocare questo metodo
       uint index = random() % players.length;
       players[index].transfer(address(this).balance);

       lastWinner = players[index];


       // riporta il sistema allo stato iniziale,
       // "svuotando" la variabile "players"
       players = new address payable[](0);

    }



    modifier restricted()
    {
        require(msg.sender == manager);
        _;
    }




    function getPlayers() public view returns (address payable[] memory)
    {
        return players;
    }


    function getLastWinner() public view returns (address)
    {
        return lastWinner;
    }

}
