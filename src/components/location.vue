<template>
    <div>
        <b-col cols="12">
            <div v-if="imageURL" class="floor-map">
                <!--<a download="'floor' + currentFloor.aesUidString" target="_blank">-->
                <b-img id="map"
                       v-bind:src="imageURL"
                       fluid
                />
                <!--</a>-->
                <div v-if="showCurrentFloorUsers" v-for="user in currentFloorUsers">
                    <div class="pin" v-bind:style="{left: relativeX(user.x) + '%', top: relativeY(user.y) + '%'}">
                    </div>
                    <div class="pulse" v-bind:style="{left: relativeX(user.x) + '%', top: relativeY(user.y) + '%'}">
                    </div>
                </div>
            </div>
        </b-col>
        <br>
        <b-col cols="12">
            <div class="d-flex justify-content-between flex-wrap flex-md-nowrap align-items-center pt-3 pb-2 mb-3 border-bottom">
                <b-col cols="6">
                    <h1 class="h2">Total users: {{totalUsers}}</h1>
                </b-col>
                <b-col cols="6">
                    <b-form-input v-model="searchedMac"
                                  type="text"
                                  placeholder="Search by entering mac-address">
                    </b-form-input>
                </b-col>
            </div>
            <br>
            <b-list-group v-if="users.length > 0">
                <div v-for="(user, index) in filteredUsers" :key="index">
                    <b-list-group-item ref="macButtons"
                                       button
                                       v-b-toggle="'collapse' + index"
                                       @click="makeActive(index)"
                                       :class="{active: index === chosenIndex}"
                                       :id="'mac-' + index"
                                       v-bind:data-index="index"
                    >
                        {{user.mac}}
                    </b-list-group-item>
                    <b-collapse class="mt-2" ref="macCollapse" :id="'collapse' + index">
                        <b-card>
                            <p>Coordinates is x: {{user.x}}, y: {{user.y}}</p>
                            <p>User is @ {{currentFloorParse(user.map.mapHierarchyString)}}</p>
                            <p>Manufacturer: {{user.manufacturer !== null ? user.manufacturer : 'N/A' }}</p>
                        </b-card>
                        <br>
                    </b-collapse>
                </div>
            </b-list-group>
        </b-col>
    </div>
</template>

<script>

    import {CMX} from './../cmx'

    export default {
        name: 'location',
        data() {
            return {
                users: [],
                totalUsers: 0,
                chosenIndex: null,
                showCollapse: false,
                imageURL: null,
                showCurrentFloorUsers: false,
                floors: [],
                currentFloorUsers: [],
                currentFloorAccessPoints: [],
                currentFloor: null,
                mapWidth: 0,
                mapHeight: 0,
                mapCurrentUser: null,
                maps: [],
                searchedMac: ''
            }
        },
        watch: {
        },
        computed: {
            filteredUsers: function () {
                let vm = this
                return this.users.filter(function (item) {
                    return item.mac.toLowerCase().indexOf(vm.searchedMac.toLowerCase()) !== -1
                })
            },
        },
        methods: {
            relativeX: async function(x) {
                await this.getMapSize(document.getElementById('map'))
                let relative = ((this.mapWidth * x) / this.currentFloor.dimension.width) / this.mapWidth
                return relative * 100
            },
            relativeY: async function(y) {
                await this.getMapSize(document.getElementById('map'))
                let relative = ((this.mapHeight * y) / this.currentFloor.dimension.length) / this.mapHeight
                return relative * 100
            },
            makeActive(index) {
                if ((this.chosenIndex != null && this.$refs.macCollapse[this.chosenIndex])) {
                    this.$refs.macCollapse[this.chosenIndex].toggle()
                }
                if (this.chosenIndex === index) {
                    this.$refs.macCollapse[this.chosenIndex].toggle()
                    this.chosenIndex = null
                    this.mapCurrentUser = null
                } else {
                    this.chosenIndex = index
                    this.currentImage = this.getMap(this.filteredUsers[index].map.image.imageName)
                }
            },
            currentFloorParse(mapHierarchyString) {
                let array = mapHierarchyString.split('>')
                let string = array[array.length - 1].replace("_", " ")
                return (string)
            },
            getClients() {
                let self = this
                CMX.get('/location/v2/clients')
                    .then(response => {
                        response.data.forEach(function (el) {
                            self.users.push({
                                mac: el.macAddress,
                                x: el.mapCoordinate.x,
                                y: el.mapCoordinate.y,
                                manufacturer: el.manufacturer,
                                bytesReceived: el.bytesReceived,
                                bytesSent: el.bytesSent,
                                ipAddress: el.ipAddress,
                                map: el.mapInfo,
                            })
                        })
                        self.totalUsers = self.users.length
                        self.getAllMaps()
                    })
                    .catch(e => {
                        console.log(e)
                    })
            },
            getMapSize(map){
                this.mapHeight = map.offsetHeight
                this.mapWidth = map.offsetWidth
            },
            showMap: async function (floor) {
                let self = this
                this.currentFloor = floor
                this.showCurrentFloorUsers = false
                this.currentFloorAccessPoints = []
                this.currentFloorUsers = []
                this.currentFloorAccessPoints = floor.info.accessPoints
                console.log(this.users[0])
                await this.users.forEach(function (el) {
                    if (el.map.floorRefId === floor.info.aesUidString) {
                        self.currentFloorUsers.push(el)
                    }
                })
                this.showCurrentFloorUsers = true
                // await this.getMapSize(document.getElementById('map'))
                console.log(floor)
            },
            retrieveFloorImage(floor) {
                let self = this
                console.log(floor)
                CMX.get('/config/v1/maps/imagesource/' + floor.image.imageName, { responseType: 'arraybuffer' })
                    .then(async function(response) {
                        let imageType = response.headers['content-type'];
                        let base64 = new Buffer(response.data).toString('base64');
                        let dataURI = 'data:' + imageType + ';base64,' + base64;
                        self.floors.push({
                            imageData: dataURI,
                            info: floor,
                        })
                        if (self.floors.length === self.maps[0].floors.length) {
                            self.setFirstMap()
                        }
                    })
                    .catch(e => {
                        console.log(e)
                    })
            },
            setFirstMap: function() {
                if (this.maps[0].floors[0]) {
                    let lowest = this.maps[0].floors[0].floorNumber
                    for (let i = 0; i < this.maps[0].floors.length; i++) {
                        if (this.maps[0].floors[i].floorNumber < lowest) {
                            lowest = this.maps[0].floors[i].floorNumber
                        }
                    }
                    for (let i = 0; i < this.maps[0].floors.length; i++) {
                        if (this.floors[i].info.floorNumber === lowest) {
                            this.imageURL = this.floors[i].imageData
                            this.showMap(this.floors[i])
                            break
                        }
                    }
                }
            },
            getAllMaps: function() {
                let self = this
                CMX.get('/config/v1/maps')
                    .then(response => {
                        let i = 0
                        response.data.campuses.forEach(function (el) {
                            if (el.buildingList.length > 0) {
                                self.maps.push({
                                    floors: el.buildingList[i].floorList,
                                    name: el.buildingList[i].hierarchyName,
                                })
                                i++
                            }
                        })
                        for (let i = 0; i < self.maps[0].floors.length; i++) {
                            self.retrieveFloorImage(self.maps[0].floors[i])
                        }
                    })
                    .catch(e => {
                        console.log(e)
                    })
            },
            getMap(image) {
                this.imageURL = image
                // this.addUserOnMap(document.getElementById('map').offsetWidth, document.getElementById('map').offsetHeight)
            },
        },
        created() {
            this.getClients()
        },
    }
</script>

<style scoped>
    .floor-map {
        position: relative;
    }
    .pin {
        width: 30px;
        height: 30px;
        border-radius: 50% 50% 50% 0;
        background: #89849b;
        position: absolute;
        transform: rotate(-45deg);
        margin: -20px 0 0 -20px;
        animation-name: bounce;
        animation-fill-mode: both;
        animation-duration: 1s;
    }
    .pin:after {
        content: '';
        width: 14px;
        height: 14px;
        margin: 8px 0 0 8px;
        background: #2f2f2f;
        position: absolute;
        border-radius: 50%;
    }
    .pulse {
        background: rgba(0,0,0,0.2);
        border-radius: 50%;
        height: 14px;
        width: 14px;
        position: absolute;
        margin: 11px 0px 0px -12px;
        transform: rotateX(55deg);
        z-index: 0;
    }
    .pulse:after {
        content: "";
        border-radius: 50%;
        height: 40px;
        width: 40px;
        position: absolute;
        margin: -13px 0 0 -13px;
        animation: pulsate 1s ease-out;
        animation-iteration-count: infinite;
        opacity: 0;
        box-shadow: 0 0 1px 2px #89849b;
        animation-delay: 1.1s;
    }
    @-moz-keyframes pulsate {
        0% {
            transform: scale(0.1, 0.1);
            opacity: 0;
        }
        50% {
            opacity: 1;
        }
        100% {
            transform: scale(1.2, 1.2);
            opacity: 0;
        }
    }
    @-webkit-keyframes pulsate {
        0% {
            transform: scale(0.1, 0.1);
            opacity: 0;
        }
        50% {
            opacity: 1;
        }
        100% {
            transform: scale(1.2, 1.2);
            opacity: 0;
        }
    }
    @-o-keyframes pulsate {
        0% {
            transform: scale(0.1, 0.1);
            opacity: 0;
        }
        50% {
            opacity: 1;
        }
        100% {
            transform: scale(1.2, 1.2);
            opacity: 0;
        }
    }
    @keyframes pulsate {
        0% {
            transform: scale(0.1, 0.1);
            opacity: 0;
        }
        50% {
            opacity: 1;
        }
        100% {
            transform: scale(1.2, 1.2);
            opacity: 0;
        }
    }
    @-moz-keyframes bounce {
        0% {
            opacity: 0;
            transform: translateY(-2000px) rotate(-45deg);
        }
        60% {
            opacity: 1;
            transform: translateY(30px) rotate(-45deg);
        }
        80% {
            transform: translateY(-10px) rotate(-45deg);
        }
        100% {
            transform: translateY(0) rotate(-45deg);
        }
    }
    @-webkit-keyframes bounce {
        0% {
            opacity: 0;
            transform: translateY(-2000px) rotate(-45deg);
        }
        60% {
            opacity: 1;
            transform: translateY(30px) rotate(-45deg);
        }
        80% {
            transform: translateY(-10px) rotate(-45deg);
        }
        100% {
            transform: translateY(0) rotate(-45deg);
        }
    }
    @-o-keyframes bounce {
        0% {
            opacity: 0;
            transform: translateY(-2000px) rotate(-45deg);
        }
        60% {
            opacity: 1;
            transform: translateY(30px) rotate(-45deg);
        }
        80% {
            transform: translateY(-10px) rotate(-45deg);
        }
        100% {
            transform: translateY(0) rotate(-45deg);
        }
    }
    @keyframes bounce {
        0% {
            opacity: 0;
            transform: translateY(-2000px) rotate(-45deg);
        }
        60% {
            opacity: 1;
            transform: translateY(30px) rotate(-45deg);
        }
        80% {
            transform: translateY(-10px) rotate(-45deg);
        }
        100% {
            transform: translateY(0) rotate(-45deg);
        }
    }

</style>