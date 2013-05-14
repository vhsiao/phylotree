#Files:
* phylotree/app.js : Node.js server file
phylotree/public/phyloforce.js, phylotree/public/trees.js : frontend logic, d3.js-powered rendering
* phylotree/templates/ : HTML pages for phylotree

* cs132 _ materials/phylotree.sql.gz : A compressed MYSQL dump of the database.

* cs132 _ materials/hier-stripped.py : A python script which set up the hierarchy information table phylotree _ hierarchy. Strategy here: http://mikehillyer.com/articles/managing-hierarchical-data-in-mysql/

* cs132 _ materialscs132awslab.pem : ssh key for ec2 server

And peek at the database with the credentials in config.js

Instructions for site usage can be seen by following the link "About This Viewer" on the main site.

#Github repo:
	https://github.com/vhsiao/phylotree

# Setting up phylotree from scratch
## An outline.
1. Install MySQL and start MySQL server.
2. Edit config.js to match your MySQL credentials
3. Install Python and pip. Run:
             pip install virtualenv
             virtualenv python _ modules
             source python _ modules/bin/activate
4. Obtain ITIS database tables as a .tar.gz:
             curl http://www.itis.gov/downloads/itisMySQLTables.tar.gz | tar zx 
   And follow instructions within the newly obtained directory to incorporate this data into MySQL. Do not delete the dump files yet. 
5. Open hier-stripped.py. Edit the line that begins:
             engine = create _ engine...
   To match your MySQL credentials. 

6. Run:
             python hier-stripped.py taxonomic _ units strippedauthor
   Replace taxonomic _ units and strippedauthor with the path to the taxonomic _ units and strippedauthor database dump files from itis. This will add the table "phylotree _ hierarchy" to the itis database.

7. You can now delete the itis dump files. To exit the python virtual environment, run:

             deactivate

8. Start the server:

             node app.js

   And point your browser to the host (path empty). For example: http://phylotree.com
