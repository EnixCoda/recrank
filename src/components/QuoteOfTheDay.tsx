import * as React from "react";
import * as fromCrank from "../recrank";

export const QuoteOfTheDay = fromCrank.async(async function QuoteOfTheDay() {
  const res = await fetch("https://favqs.com/api/qotd");
  const { quote } = await res.json();
  return (
    <p>
      “{quote.body}” – <a href={quote.url}>{quote.author}</a>
    </p>
  );
});
