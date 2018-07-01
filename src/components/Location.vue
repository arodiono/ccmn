<template>
    <div>
        <b-col cols="12" v-if="imageURL">
            <br><br>
            <b-button-group v-if="floors">
                <b-button v-for="(floor, index) in floors" :key="index">{{floor.info.floorNumber}}</b-button>
            </b-button-group>
            <br><br>
            <div class="floor-map">
                <b-img id="map" :src="imageURL" fluid></b-img>
                <div v-if="showCurrentFloorUsers" v-for="(user, index) in currentFloorUsers" class="pin"
                     @click="makeActive(user, index, true)" :style="setStyles(user.x, user.y, index)">
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
                    <b-list-group-item ref="macButtons"
                                       button
                                       v-b-toggle="'collapse-' + index"
                                       @click="makeActive(user, index, false)"
                                       :class="{active: index === chosenIndex}"
                                       :id="'mac-' + index"
                                       v-bind:data-index="index"
                    >
                        {{user.mac}}
                    </b-list-group-item>
                    <b-collapse class="mt-2" ref="collapseTab" :id="'collapse-' + index">
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
    import $ from 'jquery'

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
                    return item.mac.toLowerCase().indexOf(vm.searchedMac.toLowerCase()) !== -1
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
            makeActive(user, index, clicked) { //TODO: TOTALLY REDO
                if (clicked) {
                    this.$refs.collapseTab[index].toggle();
                }
                if (this.chosenIndex !== index) {
                    if (this.$refs.collapseTab[this.chosenIndex]) {
                        this.$refs.collapseTab[this.chosenIndex].toggle();
                    }
                    this.chosenIndex = index;
                    for (let i = 0; i < this.floors.length; i++) {
                        if (this.floors[i].info.aesUidString === user.map.floorRefId) {
                            this.showMap(this.floors[i]);
                        }
                    }
                }
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
                        });
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
                if (!this.currentFloor || this.currentFloor.info.floorNumber !== floor.info.floorNumber) {
                    let self = this;
                    this.currentFloor = floor;
                    this.showCurrentFloorUsers = false;
                    this.imageURL = floor.imageData;
                    this.currentFloorUsers = [];
                    this.currentFloorAccessPoints = floor.info.accessPoints;
                    console.log(this.currentFloorAccessPoints);
                    await this.users.forEach(function (el) {
                        if (el.map.floorRefId === floor.info.aesUidString) {
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
                        await self.floors.sort();
                        if (self.floors.length === self.maps[0].floors.length) {
                            self.setFirstMap()
                        }
                    })
                    .catch(e => {
                        console.log(e)
                    })
            },
            setFirstMap: function () {
                if (this.maps[0].floors[0]) {
                    let lowest = this.maps[0].floors[0].floorNumber;
                    for (let i = 0; i < this.maps[0].floors.length; i++) {
                        if (this.maps[0].floors[i].floorNumber < lowest) {
                            lowest = this.maps[0].floors[i].floorNumber
                        }
                    }
                    for (let i = 0; i < this.maps[0].floors.length; i++) {
                        if (this.floors[i].info.floorNumber === lowest) {
                            this.showMap(this.floors[i]);
                            break;
                        }
                    }
                }
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

    .endpoint {
        width: 18px;
        height: 18px;
        border-radius: 50% 50% 50% 50%;
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
        border-radius: 50%;
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

</style>