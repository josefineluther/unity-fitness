export interface Page {
  documentId: string
  title: string
  slug: string
  heroImage: string
  showInMenu: boolean
  menuOrder: number
}

export interface Booking {
  booking_reference: string
  customer_name: string
  customer_email: string
}

export interface Event {
  title: string
  slug: string
  description: string
  datetime: string
  image: {
    url: string
    alternativeText: string
  }
  event_categories: {
    name: string
  }[]
  instructor: {
    name: string
  }
  studio: {
    name: string
  }
  spots: number
  minutes: number
  bookings: Booking[]
}

export interface Article {
  title?: string
  description?: string
  slug?: string
  cover?: { url?: string; alternativeText?: string }
  author: { name: string }
  category: { name: string }
}
