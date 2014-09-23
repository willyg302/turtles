# The SMART Conjecture

By itself, data isn't terribly interesting because it just exists -- that is, it's a noun rather than a verb. In order to be useful data must be acted upon.

The SMART Conjecture states that there are only five things we can do to data:

- Stream it
- Maintain it
- Analyze it
- Represent it
- Transform it

Together, these five actions provide all the tools we need to work with data. Let's look at each of them in turn.

## Stream

A stream is data in motion. The concept can be illustrated in a very literal sense with a babbling brook weaving its way through a forest. Imagine stuffing little bits of information, written on pieces of paper, into tin cans and setting them afloat on the water: they'll get carried along by the current and travel downstream. Where they'll end up you do not know, but you can be certain that your little pieces of paper are going *somewhere*.

However, there's a better example courtesy of a movie called *The Lord of the Rings: The Return of the King*:

<div class="embed-responsive embed-responsive-16by9">
    <iframe width="560" height="315" src="http://www.youtube.com/embed/i6LGJ7evrAg?start=86" frameborder="0" allowfullscreen></iframe>
</div>

<small>"The Lighting of the Beacons" from *The Lord of the Rings: The Return of the King* (2003)</small>

<div class="panel panel-default">
    <div class="panel-heading">
        The Story Behind the Beacons
    </div>
    <div class="panel-body">
        For those of you who are not familiar with *The Lord of the Rings*, I give you my elevator summary. There are two kingdoms, Gondor and Rohan, separated by a distance of [500 miles-ish](http://scienceblogs.com/dotphysics/2010/07/30/how-fast-is-the-beacon-of-gond/). Gondor is suddenly besieged by evil forces and needs help from Rohan. Thankfully, they've got this pretty sweet beacon system set up between them. I should also probably mention that this is a time before telegraphs and text messaging, so [yo-ing Rohan](http://www.justyo.co/) for help is not an option.
    </div>
</div>

The beacons are an example of a binary stream: either the beacons are lit (corresponding to a 1) or they're not (corresponding to a 0). When the first bit is flipped to a 1 on Gondor's end, it begins moving down the stream until it reaches Rohan: that's data in motion. Simple, right?

Streams have several other important properties:

- **Streams are finite**. They must have a beginning and an end. They also must have finite width, often called the *capacity* or *bandwidth*. The width of a stream may vary along its length; we say that its overall width is its [maximum flow](http://en.wikipedia.org/wiki/Maximum_flow_problem).
- **Streams are linear**. This does not describe the physical shape of a stream, because in practice streams are usually anything but straight lines. Rather, this suggests that a stream has only one beginning and one end.
- **Streams have direction** (indeed, for data to be moving it *must* have direction). We can therefore represent a stream as a vector going in either direction between its beginning and end.
- **Streams are composable**. The end of one stream can be linked to the beginning of another. This is an extremely powerful concept that allows for the construction of *networks*.

Try to apply these properties to the beacon example. Do all of them hold?

A stream is the basic building block for interacting with data, and any time there is any notion of information transfer (for example, from this screen to your eyes) a stream is hard at work. Because they're so important, we shall revisit them in a later chapter and examine their properties in more detail.

<!--
Types of stream networks:

Chain
Fork
Funnel
Mux (funnel where only one input is forwarded)
Demux (fork where only one input is sent to)
-->

## Maintain

<!--Data, by itself, decays (principle of entropy). We forget things. If something is written down, the paper yellows and the ink fades. Hard disks get corrupted. Thus we must expend energy to maintain the data.-->

## Analyze

<!--Data, by itself, does not "mean" anything. We draw meaning from data by analyzing it. For example, if a cup with a capacity of 100 mL currently contains 50 mL, we can say that it is either "half full" or "half empty". If a number is displayed as red, that usually has a bad connotation, but in some cultures red is good.-->

## Represent

<!--5, five, FIVE, 005, V, and 101 are all different representations of the number five. You can stretch what is a representation pretty far. Bar graphs, sculptures, different languages, art, etc. are all representations of data.-->

## Transform

<!--5 + 1 = 6. We have transformed the number 5 into the number 6 by adding 1 to it. Note that this is **not** a change in representation, but a change in the underlying data itself, although the distinction between representation and data is very fuzzy (see below).-->
