import TicketService from "../src/pairtest/TicketService";
import InvalidPurchaseException, {
  checkAccountID,
  checkInfantsWithAdults,
  checkMaxTicketsPerOrder,
  checkTicketType,
  ticketRequest,
} from "../src/pairtest/lib/InvalidPurchaseException";
import TicketTypeRequest from "../src/pairtest/lib/TicketTypeRequest";

describe("InvalidPurchaseException", () => {
  it("should create an instance with the correct name and message", () => {
    const error = new InvalidPurchaseException("Test error message");
    expect(error.name).toBe("InvalidPurchaseException");
    expect(error.message).toBe("Test error message");
  });
});

describe("Validation Functions", () => {
  it("checkMaxTicketsPerOrder should throw an error if the number of tickets is exceeded", () => {
    expect(() => checkMaxTicketsPerOrder(21)).toThrow(InvalidPurchaseException);
    expect(() => checkMaxTicketsPerOrder(20)).not.toThrow(
      InvalidPurchaseException
    );
  });

  it("checkAccountID should throw an error if the account ID is invalid", () => {
    expect(() => checkAccountID("invalid")).toThrow(InvalidPurchaseException);
    expect(() => checkAccountID(0)).toThrow(InvalidPurchaseException);
    expect(() => checkAccountID(1)).not.toThrow(InvalidPurchaseException);
  });



  it("checkInfantsWithAdults should throw an error if the number of infants is greater than adults", () => {
    expect(() => checkInfantsWithAdults(2, 1)).toThrow(
      InvalidPurchaseException
    );
    expect(() => checkInfantsWithAdults(1, 2)).not.toThrow(
      InvalidPurchaseException
    );
  });
});

describe("ticketRequest", () => {
  // Mock the payment and seat reservation services for testing
  const mockPaymentService = {
    makePayment: jest.fn(),
  };

  const mockSeatReservationService = {
    reserveSeat: jest.fn(),
  };

  const ticketService = new TicketService(
    mockPaymentService,
    mockSeatReservationService
  );

  it("should return a successful purchase response", async () => {
    // Mock the payment and seat reservation services
    mockPaymentService.makePayment.mockResolvedValue("Payment Success");
    mockSeatReservationService.reserveSeat.mockResolvedValue(
      "Seat Reservation Success"
    );
    const mockTicketRequest = [
      new TicketTypeRequest("INFANT", 2),
      new TicketTypeRequest("CHILD", 3),
      new TicketTypeRequest("ADULT", 4),
    ];

    const purchaseResponse = await ticketService.purchaseTickets(
      123,
      ...mockTicketRequest
    );

    expect(purchaseResponse).toEqual({
      is_success: true,
      message: "Congrats! Seats are booked! Enjoy your movie!!!",
      totalPrice: 110,
      totalSeats: 7,
    });
  });

  it("should throw an InvalidPurchaseException for an invalid purchase request", () => {
    const accountID = 0;
    const ticketTypeRequest = [];

    expect(() => ticketRequest(accountID, ticketTypeRequest)).toThrow(
      InvalidPurchaseException
    );
  });
});
