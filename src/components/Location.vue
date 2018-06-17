<template>
    <div>
        <b-col cols="12">
            <div v-if="imageURL" class="floor-map">
                <a download target="_blank">
                    <b-img id="map"
                           :src="'https://cisco-cmx.unit.ua/api/config/v1/maps/imagesource/' + imageURL"
                           fluid
                    />
                    <div v-if="mapCurrentUser">
                        <div class="pin" v-bind:style="{left: relativeX + '%', top: relativeY + '%'}">
                        </div>
                        <div class="pulse" v-bind:style="{left: relativeX + '%', top: relativeY + '%'}">
                        </div>
                    </div>
                </a>
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
                    <b-collapse class="mt-2" ref="macCollapse" :id="'collapse' + (index)">
                        <b-card>
                            <p>Coordinates is x: {{user.x}}, y: {{user.y}}</p>
                            <p>User is @ {{currentFloor(user.map.mapHierarchyString)}}</p>
                            <p>Manufacturer: {{user.manufacturer}}</p>
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
            relativeX: function() {
                let relative = ((this.mapWidth * this.mapCurrentUser.x) / this.mapCurrentUser.map.floorDimension.width) / this.mapWidth
                return relative * 100
            },
            relativeY: function() {
                let relative = ((this.mapHeight * this.mapCurrentUser.y) / this.mapCurrentUser.map.floorDimension.length) / this.mapHeight
                return relative * 100
            },
        },
        methods: {
            makeActive(index) {
                if ((this.chosenIndex != null && this.$refs.macCollapse[this.chosenIndex])) {
                    this.$refs.macCollapse[this.chosenIndex].toggle()
                }
                if (this.chosenIndex === index) {
                    this.$refs.macCollapse[this.chosenIndex].toggle()
                    this.chosenIndex = null
                } else {
                    this.chosenIndex = index
                    this.currentImage = this.getMap(this.filteredUsers[index].map.image.imageName)
                }
            },
            currentFloor(mapHierarchyString) {
                let array = mapHierarchyString.split('>')
                let string = array[array.length - 1].replace("_", " ")
                return (string)
            },
            addUserOnMap(width, height) {
                this.mapHeight = height
                this.mapWidth = width
                console.log(height)
                console.log(width)
                this.mapCurrentUser = this.users[this.chosenIndex]
                console.log(this.mapCurrentUser)
            },
            getMap(image) {
                this.imageURL = image
                this.addUserOnMap(document.getElementById('map').offsetWidth, document.getElementById('map').offsetHeight)
            },
        },
        beforeCreate() {
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
                    if (self.maps[0].floors[0].image.imageName) {
                        self.imageURL = self.maps[0].floors[0].image.imageName
                    }
                })
                .catch(e => {
                    console.log(e)
                })
            CMX.get('/location/v2/clients')
                .then(response => {
                    response.data.forEach(function (el) {
                        self.users.push({
                            mac: el.macAddress,
                            x: el.mapCoordinate.x,
                            y: el.mapCoordinate.y,
                            manufacturer: el.manufacturer,
                            map: el.mapInfo,
                        })
                        console.log(el)
                    })
                    self.totalUsers = self.users.length
                })
                .catch(e => {
                    console.log(e)
                })
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