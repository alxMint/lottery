const assert = require('assert');
const ganache = require('ganache');
const { Web3 } = require('web3');
const web3 = new Web3(ganache.provider());


const { abi, evm } = require('../compile');

let lottery;
let accounts;

beforeEach(async () =>
{
    accounts = await web3.eth.getAccounts();

    lottery = await new web3.eth.Contract(abi)
        .deploy({ data: evm.bytecode.object })
        .send({ from: accounts[0], gas: '1000000' });
})


describe('Contratto Lotteria', () => 
    {
        it('deploya un contratto', () => 
        {
            console.log(lottery);
            assert.ok(lottery.options.address);
        })

        it('consente di partecipare ad un account', async() =>
        {
            await lottery.methods.enter().send
            (
                {
                    from: accounts[0],
                    value: web3.utils.toWei('0.02', 'ether')
                }
            );

            const players = await lottery.methods.getPlayers().call
            (
                {
                    from: accounts[0]
                }
            )
        
            assert.equal(accounts[0], players[0]);
            assert.equal(1, players.length);
        });





        it('consente di partecipare a multipli account', async() =>
            {
                await lottery.methods.enter().send
                (
                    {
                        from: accounts[0],
                        value: web3.utils.toWei('0.02', 'ether')
                    }
                );

                await lottery.methods.enter().send
                (
                    {
                        from: accounts[1],
                        value: web3.utils.toWei('0.02', 'ether')
                    }
                );

                await lottery.methods.enter().send
                (
                    {
                        from: accounts[2],
                        value: web3.utils.toWei('0.02', 'ether')
                    }
                );


                const players = await lottery.methods.getPlayers().call(
                    {
                        from: accounts[0]
                    })
            
                    assert.equal(accounts[0], players[0]);
                    assert.equal(accounts[1], players[1]);
                    assert.equal(accounts[2], players[2]);
                    assert.equal(3, players.length);
            });
    
            // FAIL TEST
            // value 0.000001 < 0.1 eth
            // it('requires a minimum amount of ether to enter', async () => 
            // { 
            //     try 
            //     { 
            //         await lottery.methods.enter().send
            //         (
            //             { 
            //                 from: accounts[0], 
            //                 value: web3.utils.toWei('0.000001', 'ether') 
            //             }); 
            //     } 
            //     catch (err) 
            //     { 
            //         console.log("error >>> " + err);
            //         assert(false);
            //     } 

            //     assert(true);
            // });

            // FAILING TEST
            // value 0 < 0.1 eth
            it('richiede un minimo di ether per partecipare', async () => 
                { 
                    try 
                    { 
                        await lottery.methods.enter().send
                        (
                            { 
                                from: accounts[0], 
                                value: 0
                            }); 
                    } 
                    catch (err) 
                    { 
                        console.log("error >>> " + err);
                        assert(false);
                    } 
    
                    assert(true);
                });



// metodo scegli vincitore
// controlla che le chiamate arrivino solo da utente autorizzato (manager)
    it
    (
        `solo il manager puo' eseguire l'estrazione del vincitore`, async() =>
        {
            try
            {
                await lottery.methods.pickWinner().send
                (
                    {
                        from: accounts[1]
                    }
                );
                assert(false);
            }
            catch(err)
            {
                assert(err);
            }
        }   
    );



    it 
    (
        'invia montepremi al vincitore e svuota elenco giocatori', async ()=>
        {
            await lottery.methods.enter().send(
                {
                    from: accounts[0],
                    value: web3.utils.toWei('2', 'ether')
                }
            )

            const initialBalance = await web3.eth.getBalance(accounts[0]);

            await lottery.methods.pickWinner().send({ from: accounts[0] });

            const finalBalance = await web3.eth.getBalance(accounts[0]);

            const difference = finalBalance - initialBalance;

            console.log(finalBalance - initialBalance); 

            assert(difference > web3.utils.toWei('1.8', 'ether'));
        }
    )
})