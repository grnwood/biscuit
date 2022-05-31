
# biscuit.js
Crawl a sitemap and report on some timings.

This can be used as a cache warmer and/or a tool to run over time and check the performance of a site.

## Usage.
biscuit.js
Crawl sitemaps and get some numbers.

usage: node biscuit.js <url-to-sitemap>

optional:
 --limit=X	        # limit to X URLs regardless of sitemap entries
 --randomize	    # randomize URLs out of the sitemap
 --user=<user> --password=<pass>
 
## Sample output

C:\Program Files\nodejs\node.exe .\biscuit.js https://site.com/sitemap_index.xml --limit=50 --randomize --user=storefront --password=password123

! Parsing sitemap https://site.com/sitemap_index.xml

node_modules/sitemapper/lib/assets/sitemapper.js:1
		 ! Limiting urls to 50 URLs
		 ! Randomizing sitemap URLs
		 ! Site has 2929 urls to warm up ...
! 			 Limiting to 50 crawls
	! Queueing up URLs.. #
! DONE queueing

! biscuit is done.
	 TOTAL wt: 68312.388  (1394.130 avg ms)	 Processed Count: 50
! 			 Of 50 there were 6 errors. 12% error rate
! https://site.com/handbag-R322.html	 (200/OK)
