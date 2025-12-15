/* eslint-disable */
import axios from 'axios';
import { showAlert } from './alerts';

export const bookTour = async (tourId) => {
  try {
    const stripe = Stripe(
      'pk_test_51SeEhL0goE98o7q84EwLV4dBxV6ZnH8uGjnjt5ncbuWxrnbIwiYlUo7YHZbBGdBxWazaLj8xRnfIbmHFQgFXQOBw00hlYc0tBe',
    );

    // 1) Get checkout session from API
    const session = await axios(`/api/v1/bookings/checkout-session/${tourId}`);
    // console.log(session);

    // 2) Create checkout form + charge credit card
    await stripe.redirectToCheckout({
      sessionId: session.data.session.id,
    });
  } catch (err) {
    showAlert('error', err);
  }
};
