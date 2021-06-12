// user details 
let bpiDefault = { change: '', code: '' };
Vue.component('vue-calculator', {
    template: `
    <div>
    <div class="container">
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
      <p><center>Enter Donation amount: </center></p>
      <div class="row align-items-center ">
        <div class="col-sm-10 col-md-6 ml-auto">
          <div class="input-group">
            <div class="input-group">
              <input type="text"
                     class="form-control "
                     placeholder="0.0"
                     v-model="inputValue">
              
            </div>
            <span class="underline"></span>
            <span>{{conversion}}</span>
          </div>
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

        // select active tab wallet 
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
    mounted() {
        this.selectWallet(this.tab);
    },
});