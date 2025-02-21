/*
/data/db/table/records:[pk1, pk2, ..., pkn]
/data/db/table/index_field1
/data/db/table/index_field2
...
 */

require("../../../../../builds/output/testsRuntime");
const double_check = require("double-check");
const assert = double_check.assert;
const db = require("../../../db");
const tir = require("../../../../../psknode/tests/util/tir");
$$.LEGACY_BEHAVIOUR_ENABLED = true;

const filter =  {
    start: function (callback) {
        this.callback = callback;

        double_check.createTestFolder('AddFilesBatch', async (err, folder) => {
            tir.launchApiHubTestNode(100, folder, async err => {
                assert.true(err === null || typeof err === "undefined", "Failed to create server.");

                let keySSIApis = require("../../../keyssi");
                let storageSSI = keySSIApis.createSeedSSI("default");
                this.db = db.getWalletDB(storageSSI, "testDb");
                this.addIndexes();
            });
        });

    },

    addIndexes: function () {
        this.db.addIndex("test", "value", (err) => {
            if (err) {
                throw err;
            }

            this.db.addIndex("test", "text", (err) => {
                if (err) {
                    throw err;
                }
                this.insertRecords();
            });
        });
    },

    insertRecords: function () {
        this.db.insertRecord("test", "key1", {value: 0, text: "abc"}, (err, res) => {
            if (err) {
                throw err;
            }

            this.db.insertRecord("test", "key2", {value: 1, text: "bcde"}, (err, res) => {
                if (err) {
                    throw err;
                }

                this.db.insertRecord("test", "key3", {value: 2, text: "231254"}, (err, res) => {
                    if (err) {
                        throw err;
                    }

                    this.showValuesLessThan();
                });
            });
        });

    },

    showValuesLessThan: function () {
        this.db.filter("test", ["value <= 2", "value > 0"], "asc", 1, (err, res) => {
            if (err) {
                throw err;
            }


            assert.true(res.length === 1, `Expected to receive 1 record, but got ${res.length}`);
            assert.arraysMatch(res.map(el => el.value), [1]);
            this.db.filter("test", "value <= 2", "dsc", (err, res) => {
                if (err) {
                    throw err;
                }

                assert.true(res.length === 3, `Expected to receive 3 records, but got ${res.length}`);
                this.updateRecords();
            });
        });
    },

    updateRecords: function () {
        this.db.updateRecord("test", "key1", {value: 7, text: "fdsf"}, () => {
            this.db.insertRecord("test", "key4", {value: 8, text: "bvccvb"}, () => {
                this.showValuesGreaterThan();
            });
        });
    },

    showValuesGreaterThan: function () {
        this.db.filter("test", "value > 0", "asc", (err, res) => {
            if (err) {
                throw err;
            }

            assert.true(res.length === 4);
            // assert.arraysMatch(res.map(el => el.__key), ["key2", "key3", "key1", "key4"]);

            this.db.filter("test", "value >= 0", "asc", 2, (err, res) => {
                if (err) {
                    throw err;
                }
                assert.true(res.length === 2);
                // assert.arraysMatch(res.map(el => el.__key), ["key2", "key3"]);
                this.showValuesEqualWith();
            });
        });
    },

    showValuesEqualWith: function () {
        this.db.filter("test", "value == 1", (err, res) => {
            if (err) {
                throw err;
            }

            assert.true(res.length === 1);
            this.db.filter("test", "text like /^[a-zA-Z]+$/i", (err, res) => {
                if (err) {
                    throw err;
                }

                assert.true(res.length === 3);
                this.showAllValues();
            });
        });
    },

    showAllValues: function () {
        this.db.filter("test", (err, res) => {
            if (err) {
                throw err;
            }

            assert.true(res.length === 4);
            this.callback()
        });
    }
}
assert.callback("DB filtering test", (callback) => {
    filter.start(callback);
}, 10000);