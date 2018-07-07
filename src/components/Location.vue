<template>
    <div>
        <div class="alert-message">
            <b-alert v-for="newUser in diff" :show="dismissCountDown"
                     @dismissed="dismissCountDown = 0"
                     @dismiss-count-down="countDownChanged">
                MAC: {{newUser.macAddress}} now is on the {{currentFloorParse(newUser.mapInfo.mapHierarchyString)}}.
            </b-alert>
        </div>
        <br>
        <b-row>
            <b-col cols="4">
                <b-button-group v-if="floors">
                    <b-button v-for="(floor, index) in floors" @click="showMap(floor, true)" :key="index">
                        {{floor.info.floorNumber}}
                    </b-button>
                </b-button-group>
            </b-col>
            <b-col cols="8">
                <h1 class="h4">Total users: {{users.length}} / At Floor: {{currentFloorUsers.length}}</h1>
            </b-col>
        </b-row>
        <b-col cols="12" v-if="imageURL">
            <div class="floor-map">
                <b-img id="map" :src="imageURL" fluid></b-img>
                <div v-for="(user, index) in currentFloorUsers"
                     :class="{'pin-associated': (user.dot11Status === 'ASSOCIATED'),
                                'pin-unassociated': (user.dot11Status !== 'ASSOCIATED')}"
                     @click="showModalUser(user, index)"
                     :style="setStyles(user.styles.x, user.styles.y, index)">
                </div>
                <div v-for="endPoint in currentFloorAccessPoints" class="endpoint"
                     :style="setStyles(relativeX(endPoint.mapCoordinates.x), relativeY(endPoint.mapCoordinates.y), -1)">
                </div>
            </div>
        </b-col>
        <br>
        <b-col cols="12">
            <b-form-input type="text"
                          v-model="searchedMac"
                          placeholder="Search by MAC-address">
            </b-form-input>
            <b-list-group v-if="users.length > 0">
                <div v-for="(user, index) in filteredUsers" :key="index">
                    <b-list-group-item
                            button
                            @click="showSearchedUser(user, index)"
                            :class="{active: index === listIndex}"
                            v-bind:data-index="index"
                    >
                        {{user.macAddress}}
                    </b-list-group-item>
                </div>
            </b-list-group>
        </b-col>
        <br>
        <b-modal v-model="modalShow" ref="modal" size="md" hide-footer title="User info">
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
                    <p class="my-4">IP addresses: N/A</p>
                </div>
                <p class="my-4">Coordinates: x = {{mapCurrentUser.mapCoordinate.x}}, y =
                    {{mapCurrentUser.mapCoordinate.y}}</p>
                <p class="my-4">Current Floor: {{currentFloorParse(mapCurrentUser.mapInfo.mapHierarchyString)}}</p>
                <p class="my-4">First Seen: {{getSeenTime(mapCurrentUser.statistics.firstLocatedTime)}} ago</p>
                <p class="my-4">Last Seen: {{getSeenTime(mapCurrentUser.statistics.lastLocatedTime)}} ago</p>
                <p class="my-4">Manufacturer: {{mapCurrentUser.manufacturer === null ? 'N/A' :
                    mapCurrentUser.manufacturer}}</p>
                <p class="my-4">Connected AP: {{mapCurrentUser.apMacAddress === '' ? 'Unknown' :
                    mapCurrentUser.apMacAddress}}</p>
                <p class="my-4">Detecting Controllers: {{mapCurrentUser.detectingControllers}}</p>
                <p class="my-4">SSID: {{mapCurrentUser.ssId === '' ? 'Unknown' : mapCurrentUser.ssId}}</p>
                <p class="my-4">Username: {{mapCurrentUser.userName === '' ? 'Unknown' : mapCurrentUser.userName}}</p>
                <p class="my-4">Band: {{mapCurrentUser.band === '' ? 'Unknown' : mapCurrentUser.band}}</p>
                <p class="my-4">Bytes Received: {{mapCurrentUser.bytesReceived}}</p>
                <p class="my-4">Bytes Sent: {{mapCurrentUser.bytesSent}}</p>
            </div>
            <b-btn class="mt-3" variant="outline-danger" block @click="modalShow = !modalShow">Close Me</b-btn>
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
                diff: [],
                interval: null,
                dismissSecs: 5,
                dismissCountDown: 0,
                chosenIndex: null,
                listIndex: null,
                imageURL: null,
                modalShow: false,
                floors: [],
                currentFloor: null,
                currentFloorIndex: 0,
                mapWidth: 0,
                mapHeight: 0,
                mapCurrentUser: null,
                maps: [],
                searchedMac: ''
            }
        },
        watch: {
            users() {
                this.showMap(this.currentFloor, false);
            },
            modalShow(newValue) {
                if (newValue === false) {
                    this.chosenIndex = null;
                    this.listIndex = null;
                }
            },
            imageURL(newValue, oldValue) {
                if (oldValue === null) {
                    this.getUsers();
                    clearInterval(this.interval);
                    this.interval = setInterval(() => {
                        this.getUsers();
                    }, 5000);
                }
            },
        },
        computed: {
            filteredUsers: function () {
                let vm = this;
                return this.users.filter(function (item) {
                    return item.macAddress.toLowerCase().indexOf(vm.searchedMac.toLowerCase()) !== -1
                })
            },
            currentFloorUsers() {
                let result = [];
                this.users.forEach(el => {
                    if (el.mapInfo.floorRefId === this.currentFloor.info.aesUidString) {
                        el.styles = {};
                        el.styles.x = this.relativeX(el.mapCoordinate.x);
                        el.styles.y = this.relativeY(el.mapCoordinate.y);
                        result.push(el)
                    }
                });
                return result;
            },
            currentFloorAccessPoints() {
                return this.currentFloor.info.accessPoints;
            }
        },
        methods: {
            showSearchedUser: async function (user, index) {
                let floor = this.floors.find(el => el.info.aesUidString === user.mapInfo.floorRefId);
                await this.showMap(floor, true);
                for (let i = 0; i < this.currentFloorUsers.length; i++) {
                    if (user.macAddress === this.currentFloorUsers[i].macAddress) {
                        this.showModalUser(user, i);
                        this.listIndex = index;
                        break;
                    }
                }
            },
            setStyles(x, y, index) {
                let styles = {};
                if (index === this.chosenIndex) {
                    styles = {
                        left: x + '%',
                        top: y + '%',
                        backgroundColor: 'red',
                        boxShadow: '0 0 10px rgba(0,0,0,0.7), 0 0 20px rgba(0,0,0,0.7), 0 0 30px rgba(0,0,0,0.7)',
                        opacity: 1,
                        zIndex: 100
                    };
                } else {
                    styles = {
                        left: x + '%',
                        top: y + '%',
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
            showModalUser: async function (user, index) {
                this.chosenIndex = index;
                this.mapCurrentUser = user;
                this.$refs.modal.show();
            },
            getSeenTime(time) {
                let now = new Date().getTime() / 1000;
                let result = '';
                let userDate = new Date(time).getTime() / 1000;
                let differ = now - userDate;
                let hours = Math.floor((differ / 3600));
                if (hours !== 0) {
                    result += hours + 'h ';
                }
                let minutes = Math.floor((differ % 3600) / 60);
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
            getMapSize() {
                let map = $('#map');
                this.mapHeight = map.height();
                this.mapWidth = map.width();
            },
            showMap: async function (floor, clicked) {
                if (floor != null) {
                    if (clicked) {
                        this.chosenIndex = null;
                        this.listIndex = null;
                    }
                    this.currentFloor = floor;
                    this.imageURL = floor.imageData;
                    await this.getMapSize();
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
            findNew(arr) {
                let dict = [];
                let result = [];
                arr.forEach(el => {
                    dict[el.macAddress] = el;
                    dict.length++;
                });
                for (let i = 0; i < this.users.length; i++) {
                    if (dict[this.users[i].macAddress]) {
                        delete dict[this.users[i].macAddress];
                        dict.length = dict.length - 1;
                    }
                }
                let tmp = Object.entries(dict);
                tmp.forEach(el => {
                    result.push(el[1]);
                });
                return result;
            },
            getUsers() {
                let vm = this;
                CMX.get('/location/v2/clients')
                    .then(async response => {
                        let arr = [];
                        await response.data.forEach(el => {
                            arr.push(el)
                        });
                        if (vm.users.length !== 0) {
                            vm.diff = vm.findNew(arr);
                        }
                        if (vm.diff.length > 0) {
                            for (let i = 0; i < vm.diff.length; i++) {
                                vm.showAlert();
                            }
                        }
                        vm.users = arr;
                    })
                    .catch(e => {
                        console.log(e)
                    })
            },
            countDownChanged(dismissCountDown) {
                this.dismissCountDown = dismissCountDown
            },
            showAlert() {
                this.dismissCountDown = this.dismissSecs
            }
        },
        created() {
            this.getAllMaps();
        },
    }
</script>

<style scoped>
    .floor-map {
        margin: 0 auto;
        position: relative;
        max-width: 1765px;
        max-height: 897px;
    }

    .alert-message {
        font-size: 0.9rem;
        position: fixed;
        padding: 10px 20px;
        bottom: 0;
        left: 0;
        z-index: 101;
    }

    .pin-associated {
        width: 18px;
        height: 18px;
        border-radius: 50%;
        background: #9b9895;
        opacity: 0.8;
        position: absolute;
    }

    .pin-associated:after {
        content: '';
        width: 10px;
        height: 10px;
        margin: 4px 0 0 4px;
        background: #2f2f2f;
        opacity: 0.8;
        position: absolute;
        border-radius: 50%;
    }

    .pin-unassociated {
        width: 18px;
        height: 18px;
        border-radius: 50%;
        background: #fe631f;
        opacity: 0.8;
        position: absolute;
    }

    .pin-unassociated:after {
        content: '';
        width: 10px;
        height: 10px;
        margin: 4px 0 0 4px;
        background: #2f2f2f;
        position: absolute;
        opacity: 0.8;
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