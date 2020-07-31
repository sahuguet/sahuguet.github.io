# Building a PPE Marketplace using Airtable and Stacker

With post-COVID re-opening, a lot of businesses (large and small) need to purchase personel protection equipment (PPE) for their employees and/or customers.

New York City Economic Development Corporation ([NYCEDC](https://edc.nyc/)) has the mission to "promote economic growth in New York City". To help with the re-opening, NYCEDC issued a public sollicitation for "Personal Protective Equipment Marketplace" (see PDF here; the original webpage has been removed).

From the original document, NYCEDC was asking for
> Specifically, we envision that a technology partner would design, develop and host a digital marketplace that has the following features:
> * A digital destination where businesses can source PPEs from local (NYC-based) manufacturers and distributors
> * A user-friendly interface that invites buyers to search by several product criteria
> * A simple onboarding process for both buyers and sellers, which includes, but is not limited
to:
>  * Ability to ask questions of buyers to determine basic information (e.x. zip code,
industry, number of employees, volume and type of PPE needed, etc.) as well as
potential eligibility for free supplies that may be provided by the City.
>  * An ability to onboard sellers with various levels of pre-existing capacity to sell
online, ranging from limited digital presence to fully developed digital storefronts
>  * Ability to handle both off-the-shelf items (hand sanitizer) as well as custom (plexiglass dividers)
>  * Consideration of need for translation and/or accessibility of marketplace in multiple
languages

As the co-founder of the NYC Response Lab, a hub for collaborative community solution creation and deployment in response to COVID-19, I felt that this was a sollication we had to respond. But with limited time (the sollicitation was published on June 18th, and responses were due by July 2nd) and limited resources, this was going to be mission impossible, unless ...

The first thing was to understand marketplace in a narrow sense.
The second was to use the right tools.

## Building a Kayak rather than an Expedia
From our point of view, the main goal of the NYCEDC sollicitation was to help businesses find PPE providers. Therefore our "lightweight" marketplace should focus on making this matchmaking easy for both parties.

To make an analogy to the travel sector, our lightweight marketplace is a discovery and price comparison tool (à la Kayak) rather than a booking tool (à la Expedia).

By design we chose to ignore direct interaction between buyers and sellers such as financial transactions and messaging, and reviews.

Financial transactions
* are hard to implement correctly, including taxes, shipping cost, etc.
* may require the use of third parties which may translate into extra fees for either buyer, seller or both.
* may require extra work on the seller side if there is a need to link financial accounts or transaction
systems.

Direct messaging between buyer and seller
* are hard to implement well
* introduce a new layer of complexity
* may disrupt existing processes sellers already have

Reviews are a known pitfall for any platform because (1) this is user generated content and (2) it is hard to verify that the review is genuine.

## Our Proposed User Experience

### For the buyer
Using proper SEO, the website will be easy to find for various search terms related to PPE. 

[ppe-marketplace.nyc](ppe-marketplace.nyc) is accessible to the public, with no need to create an account.

Once on the marketplace, the buyer can access the Suppliers page and get more information about each supplier.

Once on the marketplace, the buyer can access the Products page and get more information about each product. The buyer can filter by category and by supplier.

Once the buyer has found an item of interest, they can contact the supplier  directly, using the most appropriate medium, e.g. email, phone, other.


### For the seller
Suppliers need be vetted before being featured on the marketplace. They will need to be reputable NYC-based businesses (NYCEDC wants to encourage NYC business to provide PPE equipment to NYC businesses).

A supplier will first fill a form answering a few questions about their business.

Staff either from the EDC or from ppe-marketplace.nyc will check the information.
If the vetting is positive, the record will be marked as vetted in the database.
An email invitation will be sent to the supplier to create an account on ppe-marketplace.nyc.
If the vetting is negative, an email will be sent to the supplier.

The supplier can edit their profile information.

The supplier can also add new products and update existing ones.

## Implementing 
To implement the marketplace, we first focused on the data model to represent the marketplace.

### The data model
We need to represent Suppliers and the Products they sell. Our lightweight marketplace is public and we don't need to represent buyers.

This model translated to two tables: Suppliers and Products.

Table `Suppliers`
<iframe class="airtable-embed" src="https://airtable.com/embed/shrEgdqFzXoil8K9o?backgroundColor=blue" frameborder="0" onmousewheel="" width="100%" height="400" style="background: transparent; border: 1px solid #ccc;"></iframe>

Table `Products`
<iframe class="airtable-embed" src="https://airtable.com/embed/shrKFajUj2oyUbyMB?backgroundColor=blue" frameborder="0" onmousewheel="" width="100%" height="400" style="background: transparent; border: 1px solid #ccc;"></iframe>

Nothing too fancy about these two tables:
* `Suppliers` provide some key information about the supplier
* The `vetted` column is used identify suppliers who have been vetted and can be featured on the marketplace.
* A product points to a supplier.
* A product belongs to a category, e.g. masks.

At any given point in time, the marketplace features a set of vetted suppliers offering each a set of products.
Some suppliers are waiting to be vetted. Some suppliers have been rejected.

The data model in Airtable captures all of this. We now need to make it easy for suppliers to enter their information.



