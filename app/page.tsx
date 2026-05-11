import { readCarouselItems } from "@/lib/works";
import { LandingClient } from "./LandingClient";

export default function Page() {
  const items = readCarouselItems();
  return <LandingClient items={items} />;
}
