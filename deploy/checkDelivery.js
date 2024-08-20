const {queryGraphQL,startPolling} = require('@bvvvp009/hyperstatus')

async function checkStatus(){


    setTimeout(async ()=>{
        const status = await queryGraphQL({search:'0xae42db82a0233e9ced67716475faddbb34010bd095f7fc3fc226ed782829a5be'});
        console.log(status[0].id)
    },10000)
}

checkStatus()