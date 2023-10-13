import TicketTypeRequest from "./lib/TicketTypeRequest.js";
import InvalidPurchaseException, {
  ticketRequest,
} from "./lib/InvalidPurchaseException.js";
import TicketPaymentService from "../thirdparty/paymentgateway/TicketPaymentService.js";
import SeatReservationService from "../thirdparty/seatbooking/SeatReservationService.js";
import { globals } from "./lib/Globals.js";

export default class TicketService {
  /**
   * Should only have private methods other than the one below.
   */

  // declaring objects of ticket payment and seat reservation services...private using # (ECMAscript 2022 and later)
  #ticketPayment = new TicketPaymentService();
  #seatReserve = new SeatReservationService();

  purchaseTickets(accountId, ...ticketTypeRequests) {
    // throws InvalidPurchaseException
    if (ticketRequest(accountId, ticketTypeRequests)) {
      // calculate total seats
      const totalSeats = ticketTypeRequests.reduce(
        (numberOfSeats, ticketTypeRequest) => {
          if (ticketTypeRequest.getTicketType() === "INFANT") {
            return numberOfSeats;
          }
          return (numberOfSeats += ticketTypeRequest.getNoOfTickets());
        },
        0
      );

      // calculate total price
      const totalPrice = ticketTypeRequests.reduce(
        (overallPrice, ticketTypeRequest) => {
          const typeOfTicket = ticketTypeRequest.getTicketType();
          const totalTickets = ticketTypeRequest.getNoOfTickets();
          return (overallPrice +=
            globals.types_of_tickets[typeOfTicket].price * totalTickets);
        },
        0
      );

      // make a payment for order and then book a seats
      this.#ticketPayment.makePayment(accountId, totalPrice);

      // book a seats now
      this.#seatReserve.reserveSeat(accountId, totalSeats);

      return {
        is_success: true,
        message: "Congrats! Seats are booked! Enjoy your movie!!!",
        totalPrice,
        totalSeats,
      };
    } else {
      throw new InvalidPurchaseException("Failed to book seats!");
    }
  }
}
