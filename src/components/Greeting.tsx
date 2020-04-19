import * as React from "react";

export function Greeting({ name = "World" }) {
  return <div>Hello {name}</div>;
}
