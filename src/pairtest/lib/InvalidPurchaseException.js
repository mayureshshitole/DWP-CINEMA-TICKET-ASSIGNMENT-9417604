import TicketTypeRequest from "./TicketTypeRequest.js";
import { globals } from "./Globals";

export default class InvalidPurchaseException extends Error {
  constructor(errMsg) {
    super(errMsg);
    this.name = "InvalidPurchaseException";
  }
}

// function to check maximum tickets per order
export const checkMaxTicketsPerOrder = (numOfTickets) => {
  if (numOfTickets > globals.max_tickets_per_order) {
    throw new InvalidPurchaseException(
      "Maximum 20 tickets per order are allowed!"
    );
  }
  return true;
};

// function to check valid account ID or not
export const checkAccountID = (accountID) => {
  if (!Number.isInteger(accountID) || accountID <= 0) {
    throw new InvalidPurchaseException("Invalid Account ID!");
  }
  return true;
};

// function to check valid ticket type
export const checkTicketType = (ticketTypeRequest) => {
  //   const isTypeOfTickets = Object.keys(globals.types_of_tickets).every((key) =>
  //     ticketTypeRequest.includes(key)
  //   );

  //   if (!isTypeOfTickets) {
  //     throw new InvalidPurchaseException("Invalid ticket type provided!");
  //   }
  //   return true;

  const validTicketTypes = Object.keys(globals.types_of_tickets);

  for (const request of ticketTypeRequest) {
    const ticketType = request.getTicketType();
    if (!validTicketTypes.includes(ticketType)) {
      throw new InvalidPurchaseException("Invalid ticket type provided: ");
    }
  }

  return true;
};

// function to check INFANTS and ADULTS
export const checkInfantsWithAdults = (numInfants, numAdults) => {
  // at least one adult ticket is required with infant or child
  if (numAdults <= 0) {
    throw new InvalidPurchaseException("At least one Adult is required!");
  }

  // as per business rule infants must seat in adult's lap so no more than one infant per adult in a lap, for better customer experience
  if (numInfants > numAdults) {
    throw new InvalidPurchaseException(
      "Number of Infants must be equal or less than number of Adults to seat in their lap!"
    );
  }
  return true;
};

// function to check valid ticket request
export const ticketRequest = (accountID, ticketTypeRequest) => {
  if (ticketTypeRequest.length === 0) {
    throw new InvalidPurchaseException(
      "At least one ticket should be requested to book a seat!"
    );
  }

  try {
    //   calculating each ticket count
    let eachTicketCount = {
      ADULT: 0,
      CHILD: 0,
      INFANT: 0,
    };

    // Use reduce to count the ticket types
    ticketTypeRequest.reduce((count, request) => {
      count[request.getTicketType()] += request.getNoOfTickets();
      return count;
    }, eachTicketCount);

    // Extract the counts
    const numAdults = eachTicketCount.ADULT;
    const numInfants = eachTicketCount.INFANT;
    const numChild = eachTicketCount.CHILD;

    // calculating the number of tickets requested
    const numOfTickets = numAdults + numInfants + numChild;

    checkMaxTicketsPerOrder(numOfTickets);
    checkAccountID(accountID);
    checkTicketType(ticketTypeRequest);
    checkInfantsWithAdults(numInfants, numAdults);
  } catch (error) {
    // throw invalid purchase exception
    throw new InvalidPurchaseException(error.message);
  }

  return true;
};

/*

TIME COMPLEXITY ->
O(1)  - checkMaxTicketsPerOrder, checkInfantsWithAdults, checkAccountID as they have simple numerical operations
O(n)  - checkTicketType as it uses every() method to iterate where n is the number of keys
O(m)  - ticketRequest as it is dominated by reduce() method and subsequent checks with other functions as well with O(1) 

*/
