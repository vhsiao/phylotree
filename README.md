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

How to set up and host Phylotree. In this outline I am setting up Phylotree on Ubuntu where Node.js server is already installed. You can install Node <a href="http://nodejs.org/">here</a>.

Clone this repo:
	    git clone https://github.com/vhsiao/phylotree.git

1. <a href="http://dev.mysql.com/doc/refman/5.5/en/linux-installation-native.html">Install MySQL and start MySQL server.</a>
   For example:

	    sudo apt-get update
	    sudo apt-get install mysql-client-5.5 mysql-server-5.5

   This command should lead to a walkthrough for setting up credentials for the root user.    After this, MySQL server should already be running.

        mysql

   should take you to the MySQL console.

2. Install Python and pip.

        sudo apt-get install python-pip

  Run:

        sudo pip install virtualenv
        virtualenv python _ modules
        source python _ modules/bin/activate
        pip install sqlalchemy
        pip install pymysql
        
3. Obtain ITIS database tables and untar: 

        curl http://www.itis.gov/downloads/itisMySQLTables.tar.gz | tar zx 

   And follow instructions (READMEitis.txt) within the newly obtained directory to incorporate this data into MySQL.
   
        cd itisMySQL043013/
        mysql -u root -p --enable-local-infile < dropcreateloaditis.sql
Enter password: 
   
   This creates and populates the MySQL database ITIS. Do not delete the dump files yet. 
   	
   For security reasons, don't connect to MySQL as the root user with Phylotree. Before proceeding, <a href="http://dev.mysql.com/doc/refman/5.5/en/adding-users.html">create a new MySQL user with access only your new ITIS database</a>.
   Something like:
   
        mysql -u root -p
	    Enter password: 
	
        mysql> CREATE USER 'itisuser'@'localhost' IDENTIFIED BY 'some_password';
	    Query OK, 0 rows affected (0.00 sec)
	
	    mysql> GRANT ALL PRIVILEGES ON ITIS.* TO 'itisuser'@'localhost';
	    Query OK, 0 rows affected (0.00 sec)

4. Navigate back into the phylotree directory. Open hier-stripped.py. Edit the line that begins:

        engine = create _ engine...
        
   For example:
        
        engine = create_engine('mysql+pymysql://itisuser:some _ password@localhost/ITIS')

   To match your MySQL credentials. 

5. Run:

        python hier-stripped.py taxonomic _ units strippedauthor

   Replace taxonomic _ units and strippedauthor with the path to the taxonomic _ units and strippedauthor database dump files from itis. This will add the table "phylotree _ hierarchy" to the itis database.

6. You can now delete the itis dump files. To exit the python virtual environment, run:

        deactivate

7. Install node dependencies:

        npm install

8. Create a `config.js` file with the following contents:

        var config = {}
        
        config.mysql = {};
        config.redis = {};
        config.web = {};

        config.mysql.user_name = ''
        config.mysql.password = '';
        config.web.host = 'localhost';
        config.web.port = 80;

        module.exports = config;

   Update the mysql credentials as needed.


9. To start the application (stop other servers running on the same port first):

	sudo node app.js

I used Nginx and Upstart to deploy the server as a service, using <a href="http://mattpatenaude.com/hosting-chatroom/">this guide</a>. With Upstart configured, use `sudo start phylotree`, `sudo stop phylotree` and `sudo restart phylotree`
