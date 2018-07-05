<template>
    <div>
        <b-col cols="12" v-if="imageURL">
            <br><br>
            <b-button-group v-if="floors">
                <b-button v-for="(floor, index) in floors" @click="showMap(floor)" :key="index">{{floor.info.floorNumber}}</b-button>
            </b-button-group>
            <br><br>
            <div class="floor-map">
                <b-img id="map" :src="imageURL" fluid></b-img>
                <div v-if="showCurrentFloorUsers" v-for="(user, index) in currentFloorUsers" class="pin"
                     @click="showModalUser(user, index, false)" :style="setStyles(user.mapCoordinate.x, user.mapCoordinate.y, index)">
                </div>
                <div v-if="showCurrentFloorUsers" v-for="endPoint in currentFloorAccessPoints" class="endpoint"
                     :style="setStyles(endPoint.mapCoordinates.x, endPoint.mapCoordinates.y, -1)">
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
                    <b-list-group-item
                                       button
                                       @click="showModalUser(user, index, true)"
                                       :class="{active: index === listIndex}"
                                       :id="'mac-' + index"
                                       v-bind:data-index="index"
                    >
                        {{user.macAddress}}
                    </b-list-group-item>
                </div>
            </b-list-group>
        </b-col>
        <b-modal ref="modal" size="md" hide-footer title="User info">
            <div v-if="mapCurrentUser">
                <p class="my-4">Mac Address: {{mapCurrentUser.macAddress}}</p>
                <p class="my-4">Status: {{mapCurrentUser.dot11Status}}</p>
                <p class="my-4">Network Status: {{mapCurrentUser.networkStatus}}</p>
                <div v-if="mapCurrentUser.ipAddress">
                    <span>IP addresses:</span>
                    <ul>
                        <li v-for="ip in mapCurrentUser.ipAddress">{{ip}}</li>
                    </ul>
                </div>
                <div v-else>
                    <p class="my-4" >IP addresses: N/A</p>
                </div>
                <p class="my-4">Coordinates: x = {{mapCurrentUser.mapCoordinate.x}}, y = {{mapCurrentUser.mapCoordinate.y}}</p>
                <p class="my-4">Current Floor: {{currentFloorParse(mapCurrentUser.mapInfo.mapHierarchyString)}}</p>
                <p class="my-4">Last Seen: {{getLastSeen(mapCurrentUser)}} ago</p>
                <p class="my-4">Currently Tracked: {{mapCurrentUser.currentlyTracked}}</p>
                <p class="my-4">Manufacturer: {{mapCurrentUser.manufacturer === null ? 'N/A' : mapCurrentUser.manufacturer}}</p>
                <p class="my-4">Connected AP: {{mapCurrentUser.apMacAddress === '' ? 'Unknown' : mapCurrentUser.apMacAddress}}</p>
                <p class="my-4">Detecting Controllers: {{mapCurrentUser.detectingControllers}}</p>
                <p class="my-4">SSID: {{mapCurrentUser.ssId === '' ? 'Unknown' : mapCurrentUser.ssId}}</p>
                <p class="my-4">Username: {{mapCurrentUser.userName === '' ? 'Unknown' : mapCurrentUser.userName}}</p>
                <p class="my-4">Band: {{mapCurrentUser.band === '' ? 'Unknown' : mapCurrentUser.band}}</p>
                <p class="my-4">Bytes Received: {{mapCurrentUser.bytesReceived}}</p>
                <p class="my-4">Bytes Sent: {{mapCurrentUser.bytesSent}}</p>
            </div>
            <b-btn class="mt-3" variant="outline-danger" block @click="hideModal">Close Me</b-btn>
        </b-modal>
    </div>
</template>

<script>

    import {CMX} from './../cmx'
    import $ from 'jquery'

    export default {
        name: 'location',
        data() {
            return {
                users: [],
                totalUsers: 0,
                chosenIndex: null,
                listIndex: null,
                showCollapse: false,
                imageURL: null,
                showCurrentFloorUsers: false,
                floors: [],
                currentFloorUsers: [],
                currentFloorAccessPoints: [],
                currentFloor: null,
                currentFloorIndex: 0,
                mapWidth: 0,
                mapHeight: 0,
                mapCurrentUser: null,
                maps: [],
                searchedMac: ''
            }
        },
        watch: {},
        computed: {
            filteredUsers: function () {
                let vm = this;
                return this.users.filter(function (item) {
                    return item.macAddress.toLowerCase().indexOf(vm.searchedMac.toLowerCase()) !== -1
                })
            },
        },
        methods: {
            setStyles(x, y, index) {
                let styles = {};
                if (index === this.chosenIndex) {
                    styles = {
                        left: this.relativeX(x) + '%',
                        top: this.relativeY(y) + '%',
                        backgroundColor: 'red',
                        zIndex: 100
                    };
                } else {
                    styles = {
                        left: this.relativeX(x) + '%',
                        top: this.relativeY(y) + '%',
                    };
                }
                return (styles);
            },
            relativeX: function (x) {
                let relative = ((this.mapWidth * x) / this.currentFloor.info.dimension.width) / this.mapWidth;
                return relative * 100
            },
            relativeY: function (y) {
                let relative = ((this.mapHeight * y) / this.currentFloor.info.dimension.length) / this.mapHeight;
                return relative * 100
            },
            showModalUser(user, index, searched) {
                if (searched) {
                    this.listIndex = index;
                } else {
                    this.chosenIndex = index;
                }
                this.mapCurrentUser = user;
                this.$refs.modal.show();
            },
            hideModal () {
                this.listIndex = null;
                this.chosenIndex = null;
                this.$refs.modal.hide();
            },
            getLastSeen(user) {
                let now = new Date().getTime() / 1000;
                let result = '';
                let userDate = new Date(user.statistics.lastLocatedTime).getTime() / 1000;
                let differ = now - userDate;
                let minutes = Math.floor(differ / 60);
                if (minutes !== 0) {
                    result += minutes + 'm ';
                }
                result += Math.floor(differ % 60) + 's ';
                return (result);
            },
            currentFloorParse(mapHierarchyString) {
                let array = mapHierarchyString.split('>');
                let string = array[array.length - 1].replace("_", " ");
                return (string)
            },
            getClients() {
                let self = this;
                CMX.get('/location/v2/clients')
                    .then(response => {
                        response.data.forEach(function (el) {
                            self.users.push(el)
                        });
                        console.log(self.users);
                        self.totalUsers = self.users.length;
                        self.getAllMaps()
                    })
                    .catch(e => {
                        console.log(e)
                    })
            },
            getMapSize() {
                let map = $('#map');
                this.mapHeight = map.height();
                this.mapWidth = map.width();
            },
            showMap: async function (floor) {
                this.listIndex = null;
                this.chosenIndex = null;
                if (!this.currentFloor || this.currentFloor.info.floorNumber !== floor.info.floorNumber) {
                    let self = this;
                    this.currentFloor = floor;
                    this.showCurrentFloorUsers = false;
                    this.imageURL = floor.imageData;
                    this.currentFloorUsers = [];
                    this.currentFloorAccessPoints = floor.info.accessPoints;
                    console.log(this.currentFloorAccessPoints);
                    await this.users.forEach(function (el) {
                        if (el.mapInfo.floorRefId === floor.info.aesUidString) {
                            self.currentFloorUsers.push(el)
                        }
                    });
                    await this.getMapSize();
                    await setTimeout(function () {
                        self.showCurrentFloorUsers = true;
                    }, 300);
                }
            },
            retrieveFloorImage(floor) {
                let self = this;
                CMX.get('/config/v1/maps/imagesource/' + floor.image.imageName, {responseType: 'arraybuffer'})
                    .then(async function (response) {
                        let imageType = response.headers['content-type'];
                        let base64 = new Buffer(response.data).toString('base64');
                        let dataURI = 'data:' + imageType + ';base64,' + base64;
                        await self.floors.push({
                            imageData: dataURI,
                            info: floor,
                        });
                        await self.floors.sort(function (a, b) {
                            return a.info.floorNumber - b.info.floorNumber;
                        });
                        if (self.floors.length === self.maps[0].floors.length) {
                            self.showMap(self.floors[0])
                        }
                    })
                    .catch(e => {
                        console.log(e)
                    })
            },
            getAllMaps: function () {
                let self = this;
                CMX.get('/config/v1/maps')
                    .then(response => {
                        let i = 0;
                        response.data.campuses.forEach(function (el) {
                            if (el.buildingList.length > 0) {
                                self.maps.push({
                                    floors: el.buildingList[i].floorList,
                                    name: el.buildingList[i].hierarchyName,
                                });
                                i++
                            }
                        });
                        for (let i = 0; i < self.maps[0].floors.length; i++) {
                            self.retrieveFloorImage(self.maps[0].floors[i])
                        }
                    })
                    .catch(e => {
                        console.log(e)
                    })
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
        width: 18px;
        height: 18px;
        border-radius: 50% 50% 50% 50%;
        background: #9b9895;
        position: absolute;
    }

    .pin:after {
        content: '';
        width: 10px;
        height: 10px;
        margin: 4px 0 0 4px;
        background: #2f2f2f;
        position: absolute;
        border-radius: 50%;
    }

    .endpoint {
        width: 18px;
        height: 18px;
        background: #2e9b2d;
        position: absolute;
    }

    .endpoint:after {
        content: '';
        width: 10px;
        height: 10px;
        margin: 4px 0 0 4px;
        background: #284029;
        position: absolute;
    }

</style>