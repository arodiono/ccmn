<template>
    <div>
        <b-row>
            <b-col cols="8">
                <div v-if="imageURL">
                    <a :href="imageURL" download target="_blank">
                        <img :src="imageURL" alt="image" class="img-thumbnail"/>
                    </a>
                </div>
            </b-col>
            <b-col cols="4">
                <h2>Total users: {{totalUsers}}</h2>
                <b-form-input v-model="searchedMac"
                              type="text"
                              placeholder="Enter mac-address">
                </b-form-input>
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
                            </b-card>
                            <br>
                        </b-collapse>
                    </div>
                </b-list-group>
            </b-col>
        </b-row>
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
                searchedMac: ''
            }
        },
        computed: {
            filteredUsers: function () {
                let vm = this
                return this.users.filter(function (item) {
                    return item.mac.toLowerCase().indexOf(vm.searchedMac.toLowerCase()) !== -1
                })
            }
        },
        methods: {
            makeActive(index) {
                if ((this.chosenIndex != null && this.$refs.macCollapse[this.chosenIndex]) || this.chosenIndex === index) {
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
            getMap(image) {
                console.log(image)
                if (image !== this.imageURL) {
                    this.imageURL = 'https://cisco-cmx.unit.ua/api/config/v1/maps/imagesource/' + image
                }
                // let self = this
                // CMX.get('/config/v1/maps/imagesource/' + image)
                //     .then(response => {
                //         console.log(response)
                //         self.currentImage = response.data
                //     })
                //     .catch(e => {
                //         console.log(e)
                //     })
            },
        },
        beforeCreate() {
            let self = this
            CMX.get('/location/v2/clients')
                .then(response => {
                    response.data.forEach(function (el) {
                        self.users.push({
                            mac: el.macAddress,
                            x: el.mapCoordinate.x,
                            y: el.mapCoordinate.y,
                            map: el.mapInfo
                        })
                        console.log(el.mapInfo)
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

</style>