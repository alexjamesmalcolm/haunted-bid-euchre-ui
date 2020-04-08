import { html } from "../dependencies.js";

export const Card = ({ rank, suit }) => {
  const getShortRank = () => (rank == "10" ? "10" : rank.slice(0, 1));
  const getShortSuit = () => suit.slice(0, 1);
  return html`<style>
      .card {
        width: 5rem;
      }
    </style>
    <img
      class="card"
      src="./images/cards/${getShortRank()}${getShortSuit()}.jpg"
    />`;
};