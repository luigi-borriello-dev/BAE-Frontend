import {
  AfterViewInit,
  Component,
  ElementRef,
  HostListener,
  QueryList,
  ViewChild,
  ViewChildren
} from "@angular/core";
import { FontAwesomeModule } from "@fortawesome/angular-fontawesome";
import {
  faBuilding,
  faFileShield,
  faLandmark,
  faScaleBalanced,
  faShieldHalved
} from "@fortawesome/free-solid-svg-icons";
import { TranslateModule } from "@ngx-translate/core";

type RightForYouCard = {
  titleKey: string;
  descKey: string;
  icon: any;
};

@Component({
  selector: "app-landingpage-customers-right-for-you",
  standalone: true,
  imports: [TranslateModule, FontAwesomeModule],
  templateUrl: "./landing-customers-rightForYou.component.html",
  styleUrl: "./landing-customers-rightForYou.component.css"
})
export class LandingpageCustomersRightForYouComponent implements AfterViewInit {
  @ViewChild("scrollContainer")
  scrollContainer!: ElementRef<HTMLDivElement>;

  @ViewChildren("cardElement")
  cardElements!: QueryList<ElementRef<HTMLDivElement>>;

  activeCardIndex = 0;
  indicatorTop = 0;
  indicatorHeight = 0;
  indicatorVisible = false;

  stackPaddingTop = 0;
  stackPaddingBottom = 0;

  private wheelLocked = false;
  private rafId: number | null = null;
  private scrollEndTimer: ReturnType<typeof setTimeout> | null = null;
  private initialLayoutTimer: ReturnType<typeof setTimeout> | null = null;

  cards: RightForYouCard[] = [
    {
      titleKey: "LANDINGPAGE.customers.rightForYou._regulatedIndustriesTitle",
      descKey: "LANDINGPAGE.customers.rightForYou._regulatedIndustriesDesc",
      icon: faShieldHalved
    },
    {
      titleKey: "LANDINGPAGE.customers.rightForYou._enterprisesTitle",
      descKey: "LANDINGPAGE.customers.rightForYou._enterprisesDesc",
      icon: faBuilding
    },
    {
      titleKey: "LANDINGPAGE.customers.rightForYou._publicSectorTitle",
      descKey: "LANDINGPAGE.customers.rightForYou._publicSectorDesc",
      icon: faLandmark
    },
    {
      titleKey: "LANDINGPAGE.customers.rightForYou._complianceTeamsTitle",
      descKey: "LANDINGPAGE.customers.rightForYou._complianceTeamsDesc",
      icon: faScaleBalanced
    },
    {
      titleKey: "LANDINGPAGE.customers.rightForYou._structuredProcurementTitle",
      descKey: "LANDINGPAGE.customers.rightForYou._structuredProcurementDesc",
      icon: faFileShield
    }
  ];

  ngAfterViewInit(): void {
    this.runInitialLayout();

    this.cardElements.changes.subscribe(() => {
      this.runInitialLayout(this.activeCardIndex);
    });
  }

  @HostListener("window:resize")
  onResize(): void {
    this.runInitialLayout(this.activeCardIndex);
  }

  onWheel(event: WheelEvent): void {
    event.preventDefault();

    if (this.wheelLocked) {
      return;
    }

    const direction = Math.sign(event.deltaY);

    if (direction === 0) {
      return;
    }

    const nextIndex =
      direction > 0
        ? Math.min(this.activeCardIndex + 1, this.cards.length - 1)
        : Math.max(this.activeCardIndex - 1, 0);

    if (nextIndex === this.activeCardIndex) {
      return;
    }

    this.wheelLocked = true;
    this.scrollToCard(nextIndex, "smooth");

    window.setTimeout(() => {
      this.wheelLocked = false;
    }, 420);
  }

  onScroll(): void {
    if (this.rafId !== null) {
      cancelAnimationFrame(this.rafId);
    }

    this.rafId = requestAnimationFrame(() => {
      this.syncActiveCardFromScroll();
      this.rafId = null;
    });

    if (this.scrollEndTimer) {
      clearTimeout(this.scrollEndTimer);
    }

    this.scrollEndTimer = setTimeout(() => {
      this.snapToNearestCard();
    }, 90);
  }

  private runInitialLayout(index = 0): void {
    this.indicatorVisible = false;

    if (this.initialLayoutTimer) {
      clearTimeout(this.initialLayoutTimer);
    }

    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        this.updateStackPadding();
        this.scrollToCard(index, "auto");

        this.initialLayoutTimer = setTimeout(() => {
          this.updateStackPadding();
          this.scrollToCard(index, "auto");
          this.indicatorVisible = true;
        }, 60);
      });
    });
  }

  private updateStackPadding(): void {
    const container = this.scrollContainer?.nativeElement;
    const cards = this.cardElements?.toArray().map((item) => item.nativeElement);

    if (!container || !cards.length) {
      return;
    }

    const firstCard = cards[0];
    const lastCard = cards[cards.length - 1];

    this.stackPaddingTop = Math.max(
      0,
      (container.clientHeight - firstCard.offsetHeight) / 2
    );

    this.stackPaddingBottom = Math.max(
      0,
      (container.clientHeight - lastCard.offsetHeight) / 2
    );
  }

  private scrollToCard(index: number, behavior: ScrollBehavior): void {
    const container = this.scrollContainer?.nativeElement;
    const cards = this.cardElements?.toArray().map((item) => item.nativeElement);

    if (!container || !cards.length || !cards[index]) {
      return;
    }

    const card = cards[index];

    const rawTop =
      card.offsetTop - (container.clientHeight / 2 - card.offsetHeight / 2);

    const maxScrollTop = Math.max(0, container.scrollHeight - container.clientHeight);
    const targetTop = Math.max(0, Math.min(rawTop, maxScrollTop));

    this.activeCardIndex = index;

    container.scrollTo({
      top: targetTop,
      behavior
    });

    this.updateIndicatorFromCard(card, targetTop);
  }

  private snapToNearestCard(): void {
    const container = this.scrollContainer?.nativeElement;
    const cards = this.cardElements?.toArray().map((item) => item.nativeElement);

    if (!container || !cards.length) {
      return;
    }

    const viewportCenter = container.scrollTop + container.clientHeight / 2;

    let bestIndex = 0;
    let bestDistance = Number.POSITIVE_INFINITY;

    cards.forEach((card, index) => {
      const cardCenter = card.offsetTop + card.offsetHeight / 2;
      const distance = Math.abs(cardCenter - viewportCenter);

      if (distance < bestDistance) {
        bestDistance = distance;
        bestIndex = index;
      }
    });

    this.scrollToCard(bestIndex, "smooth");
  }

  private syncActiveCardFromScroll(): void {
    const container = this.scrollContainer?.nativeElement;
    const cards = this.cardElements?.toArray().map((item) => item.nativeElement);

    if (!container || !cards.length) {
      return;
    }

    const viewportCenter = container.scrollTop + container.clientHeight / 2;

    let bestIndex = 0;
    let bestDistance = Number.POSITIVE_INFINITY;

    cards.forEach((card, index) => {
      const cardCenter = card.offsetTop + card.offsetHeight / 2;
      const distance = Math.abs(cardCenter - viewportCenter);

      if (distance < bestDistance) {
        bestDistance = distance;
        bestIndex = index;
      }
    });

    this.activeCardIndex = bestIndex;
    this.updateIndicatorFromCard(cards[bestIndex], container.scrollTop);
  }

  private updateIndicatorFromCard(card: HTMLElement, scrollTop?: number): void {
    const container = this.scrollContainer?.nativeElement;

    if (!container) {
      return;
    }

    const currentScrollTop = scrollTop ?? container.scrollTop;

    this.indicatorTop = card.offsetTop - currentScrollTop;
    this.indicatorHeight = card.offsetHeight;
  }
}
