import { describe, it, expect } from "vitest";
import {
  createTextPresentationSlides,
  createTextServiceItem,
} from "@/lib/content/text.service";

describe("Text Content Service (Phase 1 §9.1)", () => {
  it("creates a single presentation slide from title and body", () => {
    const slides = createTextPresentationSlides({
      title: "Welcome",
      body: "We are glad you are here with us today!",
      subtext: "Grace Community Church",
      layout: "full-screen",
      textAlign: "center",
    });

    expect(slides).toHaveLength(1);
    expect(slides[0].title).toBe("Welcome");
    expect(slides[0].text).toBe("We are glad you are here with us today!");
    expect(slides[0].subtext).toBe("Grace Community Church");
    expect(slides[0].layout).toBe("full-screen");
    expect(slides[0].textAlign).toBe("center");
  });

  it("splits multiple paragraphs into individual presentation slides", () => {
    const multiParagraphBody =
      "Announcement 1: Youth camp registration closes this Friday.\n\nAnnouncement 2: Baptisms will take place next Sunday at 2 PM.";

    const slides = createTextPresentationSlides({
      title: "Church News",
      body: multiParagraphBody,
    });

    expect(slides).toHaveLength(2);
    expect(slides[0].title).toBe("Church News");
    expect(slides[0].text).toContain("Announcement 1");
    expect(slides[1].text).toContain("Announcement 2");
  });

  it("creates a structured ServiceItem for the service rundown", () => {
    const item = createTextServiceItem(
      {
        title: "Guest Speaker",
        body: "Bishop Donald Blake",
        subtext: "Regional Overseer",
        layout: "lower-third",
        textAlign: "left",
      },
      3
    );

    expect(item.type).toBe("text");
    expect(item.title).toBe("Guest Speaker");
    expect(item.order).toBe(3);
    expect(item.notes).toBe("Regional Overseer");
  });
});
