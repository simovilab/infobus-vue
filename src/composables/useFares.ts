export function useFares() {
  function getFares() {
    return [
      {
        fare_id: "F001",
        agency_id: "A001",
        route_id: "R100",
        payment_method: "PREPAID",
        allows_transfers: true,
        transfers: "TWO_TRANSFERS",
        transfer_duration: 7200,
        price: 2.75,
        currency_type: "USD",
        origin_id: "Z001",
        destination_id: "Z005",
        contains_id: "Z003"
      },
      {
        fare_id: "F002",
        agency_id: "A001",
        route_id: "R200",
        payment_method: "POSTPAID",
        allows_transfers: false,
        transfers: "NO_TRANSFERS",
        transfer_duration: 0,
        price: 3.00,
        currency_type: "USD",
        origin_id: "Z002",
        destination_id: "Z006",
        contains_id: "Z004"
      },
      {
        fare_id: "F003",
        agency_id: "A002",
        route_id: "R101",
        payment_method: "PREPAID",
        allows_transfers: true,
        transfers: "ONE_TRANSFER",
        transfer_duration: 3600,
        price: 1.50,
        currency_type: "EUR",
        origin_id: "Z010",
        destination_id: "Z015",
        contains_id: "Z012"
      },
      {
        fare_id: "F004",
        agency_id: "A002",
        route_id: "R201",
        payment_method: "PREPAID",
        allows_transfers: true,
        transfers: "UNLIMITED_TRANSFERS",
        transfer_duration: 10800,
        price: 4.00,
        currency_type: "EUR",
        origin_id: "Z011",
        destination_id: "Z016",
        contains_id: "Z013"
      },
      {
        fare_id: "F005",
        agency_id: "A003",
        route_id: "R300",
        payment_method: "POSTPAID",
        allows_transfers: false,
        transfers: "NO_TRANSFERS",
        transfer_duration: 0,
        price: 5.50,
        currency_type: "GBP",
        origin_id: "Z020",
        destination_id: "Z025",
        contains_id: "Z022"
      },
      {
        fare_id: "F006",
        agency_id: "A003",
        route_id: "R301",
        payment_method: "PREPAID",
        allows_transfers: true,
        transfers: "ONE_TRANSFER",
        transfer_duration: 5400,
        price: 2.25,
        currency_type: "GBP",
        origin_id: "Z021",
        destination_id: "Z026",
        contains_id: "Z023"
      }
    ]
  }

  return { getFares }
}
