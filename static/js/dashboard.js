new Vue({
    el: '#app',
    components: {
        apexcharts: VueApexCharts,
    },
    vuetify: new Vuetify(),
    data: {
        // auth
        icons: [
            {
                icon: 'mdi-facebook',
                href: 'https://www.facebook.com/mangoconsultant/'
            },
            {
                icon: 'mdi-twitter',
                href: ''
            },
            {
                icon: 'mdi-linkedin',
                href: ''
            },
            {
                icon: 'mdi-instagram',
                href: 'https://www.instagram.com/mangoconsultant/'
            },
        ],
        userAuth: {
            name: '',
            picture: '',
            email: '',
            uid: '',
            collection: '',
        },
        spinAuth: false,
        notify_today: [],
        selectedNotify: 0,
        navigatorAppbar: false,
        selectedList: 1,
        itemsAppbar: [
            {text: 'Mango', icon: 'mdi-database'},
            {text: 'Dashboard', icon: 'mdi-monitor-dashboard'},
            {text: 'Intents', icon: 'mdi-account'},
        ],
        loaderSpin: true,
        loaderData: false,

        chartOptions: {
            colors: ["#00B7C2", "#54E346", "#FECD1A",],
            xaxis: {
                categories: []
            }
        },
        chartOptionsInit: {
            colors: ["#FF2E63"],
            xaxis: {
                categories: []
            }
        },
        chartOptionsDay: {
            colors: ["#C400C6"],
            xaxis: {
                categories: []
            }
        },
        count: [],
        categories: [],
        months: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12],
        products: ['Construction', 'RealEstate', 'Project Planning', 'Other'],
        channels: ['LINE', 'GetDemo', 'Contact'],
        dialogChart: false,
        selectedChannel: '',
        selectedProduct: '',
        selectedMonth: '',
        spinChart: true,
        spinTable: false,

        headers: [
            {
                text: 'ผลิตภัณฑ์',
                value: 'product',
                width: 100
            },
            {
                text: 'ข้อมูลลูกค้า',
                value: 'name',
                align: 'center',
                width: 120
            },
            {
                text: 'บริษัท',
                value: 'company',
                width: 120
            },
            {
                text: 'ข้อความ',
                value: 'message',
                width: 120
            },
            {
                text: 'ช่องทาง',
                value: 'channel',
                width: 120
            },

        ],
        transaction: []
    },
    async mounted() {
        const path = '/secure/read'
        await axios.get(path)
            .then((res) => {
                this.loaderSpin = false
                this.loaderData = true
                let user = this.userAuth
                user.name = res.data.name
                user.picture = res.data.picture
                user.collection = res.data.collection
                user.email = res.data.email
                user.uid = res.data.uid
            })
            .catch((err) => {
                console.error(err)
            })
        await this.initialize()
        await this.chartMonthly()
        await this.initializedChart()
    },
    computed: {
        datetimeNow() {
            const today = new Date();
            return today.getDate() + '/' + (today.getMonth() + 1) + '/' + today.getFullYear();
        },
        series() {
            return [{
                name: 'series-1',
                data: [],
            }]
        },
        seriesInit() {
            return [{
                name: 'series-1',
                data: [],
            }]
        },
        seriesDay() {
            return [{
                name: 'series-1',
                data: [],
            }]
        },


    },
    methods: {
        logout() {
            return window.location = '/secure/logout'
        },
        redirectPage(item) {
            console.log(item)
            if (item.text === 'Mango')
                window.location = '/'
            if (item.text === 'Intents')
                window.location = '/intents'
            if (item.text === 'Dashboard')
                window.location = '/dashboard'
        },
        async initializedChart() {
            const path = `/api/chart/initialized?collection=${this.userAuth.collection}`;
            await axios.get(path)
                .then((res) => {
                    let data = res.data
                    data.forEach((i) => {
                        this.count.push(i.count)
                        this.categories.push(i.channel)
                    })
                    this.$refs.chartInitialized.updateSeries([
                        {
                            name: 'Channels',
                            data: this.count,
                        },
                    ])
                    this.$refs.chartInitialized.updateOptions({
                        xaxis: {
                            categories: this.categories
                        },
                    })
                })
                .catch((err) => {
                    console.error(err)
                })
        },
        async initialize() {
            this.spinTable = false
            const path = `/api/customer?collection=${this.userAuth.collection}`
            await axios.get(path)
                .then((res) => {
                    this.spinTable = true;
                    this.transaction = res.data.transaction;
                    this.products = res.data.products
                    this.channels = res.data.channels
                    this.tags = res.data.tags
                    this.href = 'customer'
                    this.btnImport = false
                })
                .catch((err) => {
                    console.log(err)
                })
        },
        async chartMonthly() {
            const path = `/api/chart/monthly?collection=${this.userAuth.collection}`;
            await axios.get(path)
                .then((res) => {
                    let data = res.data
                    let count1 = []
                    let count2 = []
                    let count3 = []
                    let categories1 = []
                    data[0].forEach((i) => {
                        count1.push(i.count)
                        categories1.push(`month ${i.month}`)
                    })

                    data[1].forEach((i) => {
                        count2.push(i.count)
                    })

                    data[2].forEach((i) => {
                        count3.push(i.count)
                    })
                    this.$refs.chart.updateSeries([
                        {
                            name: data[0][0].channel,
                            data: count1
                        },
                        {
                            name: data[1][0].channel,
                            data: count2
                        },
                        {
                            name: data[2][0].channel,
                            data: count3
                        },

                    ])
                    this.$refs.chart.updateOptions({
                        xaxis: {
                            categories: categories1
                        }
                    })
                })
                .catch((err) => {
                    console.error(err)
                })
        },
        async conditionChart() {
            this.spinChart = false
            let item = {
                product: this.selectedProduct,
                channel: this.selectedChannel
            }
            const path = `/api/chart/productAndChannel?collection=${this.userAuth.collection}`;
            await axios.post(path, item)
                .then((res) => {
                    this.count = []
                    this.categories = []
                    let data = res.data
                    console.log(res.data)
                    data.forEach((i) => {
                        this.count.push(i.count)
                        this.categories.push(`month ${i.month}`)
                    })
                    this.$refs.chartInitialized.updateSeries([
                        {
                            name: `Channel ${data[0].channel} ,Product: ${data[0].product}`,
                            data: this.count,
                        },
                    ])
                    this.$refs.chartInitialized.updateOptions({
                        xaxis: {
                            categories: this.categories
                        },
                        dataLabels: {
                            enabled: false
                        },
                    })
                    this.selectedProduct = ''
                    this.selectedChannel = ''
                    this.spinChart = true
                    this.dialogChart = false
                })
                .catch((err) => {
                    console.error(err)
                    this.spinChart = true
                    this.dialogChart = false
                    this.selectedProduct = ''
                    this.selectedChannel = ''
                })
        },
        async conditionDay() {
            this.spinChart = false
            let item = {
                month: this.selectedMonth,
                channel: this.selectedChannel
            }
            const path = `/api/chart/daly?collection=${this.userAuth.collection}`;
            await axios.post(path, item)
                .then((res) => {
                    console.log(res.data)
                    let data = res.data
                    let count = []
                    let categories = []
                    data.forEach((i) => {
                        count.push(i.count)
                        categories.push(`day ${i.day}`)
                    })
                    this.$refs.chartDay.updateSeries([
                        {
                            name: `Channel ${data[0].channel} Month ${data[0].month}`,
                            data: count,
                        },
                    ])
                    this.$refs.chartDay.updateOptions({
                        xaxis: {
                            categories: categories
                        },
                        dataLabels: {
                            enabled: false
                        },
                    })
                    this.selectedChannel = ''
                    this.selectedMonth = ''
                    this.spinChart = true
                })
                .catch((err) => {
                    this.selectedChannel = ''
                    this.selectedMonth = ''
                    this.spinChart = true
                    console.error(err)
                })
        },
        colorProduct(product) {
            if (product === 'Construction') {
                return 'green accent-1'
            }
            if (product === 'RealEstate') {
                return 'blue lighten-4'
            }
            if (product === 'Project Planning') {
                return 'pink lighten-4'
            }
            if (product === 'Consulting') {
                return 'yellow lighten-4'
            }
        },


    },
    delimiters: ["[[", "]]"],
})