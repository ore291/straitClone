// user details 



let bpiDefault = { change: '', code: '' };



Vue.component('vue-calculator', {
    template: `
    <div>
    <div class="container ">
      <div class="row" >
        <div class="col">
          <div class="price-holder">
            <span>{{displayRate}}</span>
            <span class="label ml-2" 
                  :class="bpi.change >= 0 ? 'up' : 'down'">
              {{change}}%
            </span>
          </div>
        </div>
      </div>
      <p class='text-dark text-capitalize fs-2 fw-bold bg-light rounded-pill '><center>Enter Donation amount: </center></p>
      <div class="d-flex row align-items-center justify-content-center ">
        <div class="col-sm-10 col-md-6  mb-5">
        <div class="input-group mb-3">
        <span class="input-group-text">$</span>
        <input type="number" class="form-control" aria-label="Dollar amount (with dot and two decimal places)" v-model='inputValue'>
      </div>
      
      <div class="input-group mb-3">
        <span class="input-group-text">Value</span>
        <input type="text" class="form-control"  v-model='conversion' disabled>
      </div>
        </div>
        <div class="d-grid gap-2">
  <button class="btn btn-primary mb-2" v-bind:class="{ disabled: isActive }" type="button" @click='bclick' >Continue</button>
</div>
      </div>
    </div>
  </div>`,
    data: () => ({
        endpoint: 'https://api.coindesk.com/v1/bpi/',
        trade: 'BTC',
        selectedCurrency: null,
        // timestamp: null,
        bpi: Object.assign({}, bpiDefault),
        inverted: false,
        value: null,
        supportedCurrencies: ['USD', 'AUD', 'EUR', 'CAD'],
        loading: false,
        interval: null,
        blurred: false
    }),

    mounted() {
        this.selectedCurrency = this.supportedCurrencies[0];
        this.getUpdatedPrice();

        this.interval = setInterval(() => {
            this.getUpdatedPrice();
        }, 10000);
    },
    beforeDestroy() {
        clearInterval(this.interval);
    },
    methods: {

        bclick(event) {
            this.$emit('clicked', {value : this.inputValue, bvalue: this.conversion})
        },
        getUpdatedPrice() {
            this.loading = true;
            axios.get(this.endpoint + 'currentprice/' + this.selectedCurrency + '.json').
                then(res => {
                    if (res && res.data) {
                        //   this.timestamp = moment().local().format('LT');
                        this.bpi = Object.assign(bpiDefault, res.data.bpi[this.selectedCurrency]);
                        this.getHistorical();
                    }

                    this.loading = false;
                }).
                catch(error => {
                    this.loading = false;
                    console.log(error);
                });
        },
        getHistorical() {
            axios.get(this.endpoint + 'historical/close.json?currency=' + this.selectedCurrency + '&for=yesterday').
                then(res => {
                    if (res && res.data) {
                        const y = Object.values(res.data.bpi)[0];
                        this.bpi.change = (this.rate - y) * 100 / y;
                    }
                }).
                catch(error => {
                    alert(error);
                });
        },
        setCurrency(code) {
            this.selectedCurrency = code;
            this.getUpdatedPrice();
        }
    },

    computed: {
        inputValue: {
            get() {
                return this.value;
            },
            set(value) {
                this.blurred = isNaN(value);
                if (this.blurred) {
                    return;
                }
                this.value = Number(value);
            }
        },
        isActive() {
            if (this.value === null) {
                return true
            } else {
                return false
            }
        },

        rate() {
            return this.bpi ? this.bpi.rate_float : null;
        },
        displayRate() {
            const formatter = new Intl.NumberFormat('en-US', {
                style: 'currency',
                currency: this.currency || 'USD',
                minimumFractionDigits: 2
            });


            return formatter.format(this.rate);
        },
        currency() {
            return this.bpi ? this.bpi.code : null;
        },
        change() {
            const formatter = new Intl.NumberFormat();
            return this.bpi ? formatter.format(this.bpi.change) : 'null';
        },
        conversion() {
            const val = this.inverted ? this.value * this.rate : this.value / this.rate;

            let opts = { minimumFractionDigits: this.inverted ? 2 : 4 };

            if (this.inverted) {
                opts.style = 'currency';
                opts.currency = this.currency || 'USD';
            }

            const formatter = new Intl.NumberFormat('en-US', opts);
            const result = formatter.format(val);
            return this.inverted ? result : result + ' ' + this.trade;
        }
    }
});
const userInfo = {
    avatar: 'https://s3-us-west-2.amazonaws.com/s.cdpn.io/668895/profile/profile-512.jpg',
    hero: 'https://static.codepen.io/assets/profile/profile-bg-8ff33bd9518be912289d4620cb48f21eb5c9a2e0b9577484126cfe10a5fb354f.svg',
    website: 'https://rainnerlins.com/',
    name: 'Rainner Lins',
    info: 'Fullstack Codepen Superstar Wannabe',
};

// crypto wallets 
const cryptoWallets = [
    {
        symbol: 'BTC',
        name: 'Bitcoin',
        address: '13R8NFPs7oFjDof3pQ832g1RgEkkkFqBAN',
    },
];

// number format filter 
Vue.filter('toMoney', (num, decimals) => {
    let o = { style: 'decimal', minimumFractionDigits: decimals, maximumFractionDigits: decimals };
    return new Intl.NumberFormat('en-US', o).format(num);
});

// vue instance 
new Vue({
    el: '#card',

    // app data 
    data: {
        userInfo,
        cryptoWallets,
        tab: 'BTC',
        wallet: {},
        statsCache: {},
        stats: {},
        amountD: 0,
        firstname: null,
        lastname: null,
        email: null,
        amount: null,
        donators: null,
        bvalue: null
    },

    // computed methods 
    computed: {
      
        // compute list wallets for tabs 
        walletsList() {
            return this.cryptoWallets.map(w => {
                w.active = (w.symbol === this.tab);
                return w;
            });
        },
    },

    // custom methods 
    methods: {
        

        getRecords() {

            axios.post('http://127.0.0.1:8080/ajax.php', {
                request: 1
            })
                .then((res) => {
                
                    this.donators = res.data;
                    
                    $(document).ready(function() {
                        $('#table').DataTable();})
                    // let donators1 = res.data;
                    // donators1.forEach(
                    //     this.makeArray
                    // );
                })
                .catch(function (error) {
                    console.log(error);
                });

        },
        makeArray(item){
            
            this.donators.push(Object.values(item))
        },
        addRecord: function () {
            if (this.firstname != '' && this.lastname != '' && this.email != '') {
                axios.post('http://127.0.0.1:8080/ajax.php', {
                    request: 2,
                    firstname: this.firstname.charAt(0).toUpperCase() + this.firstname.slice(1),
                    lastname: this.lastname.charAt(0).toUpperCase() + this.lastname.slice(1),
                    email: this.email,
                    amount: this.amount
                })
                    .then((res) => {
                        this.getRecords()
                        var triggerEl = document.querySelector('#contact-tab');
                        var tab = new bootstrap.Tab(triggerEl)
                        tab.show();
                        this.firstname = '';
                        this.lastname = '';
                        this.email = '';
                    })
                    .catch(function (error) {
                        console.log(error);
                    });
            } else {
                alert('Fill all fields.');
            }

        },
        fclick() {
            var triggerEl = document.querySelector('#home-tab');
            var tab = new bootstrap.Tab(triggerEl)
            tab.show();
        },
        // select active tab wallet 
        cclick(data) {
            this.amountD = `$${data.value}`;
            this.amount = data.value;
            this.bvalue = data.bvalue;
            var triggerEl = document.querySelector('#profile-tab');
            var tab = new bootstrap.Tab(triggerEl)
            tab.show();

        },

        selectWallet(symbol) {
            let wallet = this.cryptoWallets.filter(w => w.symbol === symbol).shift();
            if (!wallet) return;
            wallet.copied = 0;
            this.wallet = wallet;
            this.tab = symbol;
            //   this.fetchStats( symbol ); 
        },

        // copy text to clipboard
        copyText(txt) {
            txt = String(txt || '').trim();
            if (!txt) return;
            let input = document.createElement('input');
            document.body.appendChild(input);
            input.value = txt;
            input.select();
            document.execCommand('Copy');
            document.body.removeChild(input);
            this.wallet = Object.assign({}, this.wallet, { copied: 1 });
        },

        // get qr image url for selected wallet 
        getQrImage() {
            const w = 180;
            const h = 180;
            const a = this.wallet.address;
            return `https://chart.googleapis.com/chart?chs=${w}x${h}&cht=qr&choe=UTF-8&chl=${a}`;
        },




    },

    // when component mounts 
created() {
     
},
  mounted() {
        
        this.selectWallet(this.tab);
       this.getRecords();
        
       
      
    },
});