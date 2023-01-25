const fixture = {
  "deployments": [
    {
      "deployment": {
        "created_at": "3307232",
        "deployment_id": {
          "dseq": "3307230",
          "owner": "akash1usm9umrgzckc2pa873cmqwqplr9kuur95mz3v6"
        },
        "state": "active",
        "version": "Oa1fvss6JhrDahYETLdd1KQMyzoZshR28wlawZu9bqg="
      },
      "escrow_account": {
        "balance": {
          "amount": "5000000",
          "denom": "uakt"
        },
        "id": {
          "scope": "deployment",
          "xid": "akash1usm9umrgzckc2pa873cmqwqplr9kuur95mz3v6/3307230"
        },
        "owner": "akash1usm9umrgzckc2pa873cmqwqplr9kuur95mz3v6",
        "settled_at": "3307232",
        "state": "open",
        "transferred": {
          "amount": "0",
          "denom": "uakt"
        }
      },
      "groups": [
        {
          "created_at": "3307232",
          "group_id": {
            "dseq": "3307230",
            "gseq": 1
          },
          "owner": "akash1usm9umrgzckc2pa873cmqwqplr9kuur95mz3v6",
          "group_spec": {
            "name": "westcoast",
            "requirements": {
              "attributes": [
                {
                  "key": "host",
                  "value": "akash",
                  "signed_by": {
                    "all_of": [],
                    "any_of": [
                      "akash1365yvmc4s7awdyj3n2sav7xfx76adc6dnmlx63"
                    ]
                  }
                }
              ]
            },
            "resources": [
              {
                "count": 1,
                "price": {
                  "amount": "1000",
                  "denom": "uakt"
                },
                "resources": {
                  "cpu": {
                    "attributes": [],
                    "units": {
                      "val": "100"
                    }
                  },
                  "endpoints": [
                    {
                      "kind": "SHARED_HTTP",
                      "memory": {
                        "attributes": [],
                        "quantity": {
                          "val": "536870912"
                        }
                      },
                      "storage": {
                        "attributes": [],
                        "quantity": {
                          "val": "536870912"
                        }
                      }
                    }
                  ]
                }
              }
            ]
          },
          "state": "open"
        }
      ]
    },
    {
      "deployment": {
        "created_at": "3307318",
        "deployment_id": {
          "dseq": "3307317",
          "owner": "akash1usm9umrgzckc2pa873cmqwqplr9kuur95mz3v6"
        },
        "state": "active",
        "version": "Oa1fvss6JhrDahYETLdd1KQMyzoZshR28wlawZu9bqg="
      },
      "escrow_account": {
        "balance": {
          "amount": "3028682",
          "denom": "uakt"
        },
        "id": {
          "scope": "deployment",
          "xid": "akash1usm9umrgzckc2pa873cmqwqplr9kuur95mz3v6/3307317"
        },
        "owner": "akash1usm9umrgzckc2pa873cmqwqplr9kuur95mz3v6",
        "settled_at": "4293003",
        "state": "open",
        "transferred": {
          "amount": "1971318",
          "denom": "uakt"
        }
      },
      "groups": [
        {
          "created_at": "3307318",
          "group_id": {
            "dseq": "3307317",
            "gseq": 1,
            "owner": "akash1usm9umrgzckc2pa873cmqwqplr9kuur95mz3v6"
          },
          "group_spec": {
            "name": "westcoast",
            "requirements": {
              "attributes": [
                {
                  "key": "host",
                  "value": "akash",
                  "signed_by": {
                    "all_of": [],
                    "any_of": [
                      "akash1365yvmc4s7awdyj3n2sav7xfx76adc6dnmlx63"
                    ]
                  }
                }
              ]
            },
            "resources": [
              {
                "count": 1,
                "price": {
                  "amount": "1000",
                  "denom": "uakt"
                },
                "resources": {
                  "cpu": {
                    "attributes": [],
                    "units": {
                      "val": "100"
                    }
                  },
                  "endpoints": [
                    {
                      "kind": "SHARED_HTTP",
                      "memory": {
                        "attributes": [],
                        "quantity": {
                          "val": "536870912"
                        }
                      },
                      "storage": {
                        "attributes": [],
                        "quantity": {
                          "val": "536870912"
                        }
                      }
                    }
                  ]
                },
                "state": "open"
              }
            ]
          }
        }
      ]
    }
  ],
  "pagination": {
    "next_key": null,
    "total": "0"
  }
} as any;

export default fixture;
