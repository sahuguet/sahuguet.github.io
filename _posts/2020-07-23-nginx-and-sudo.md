# Fun with nginx and sudo

I am building a handful of static websites these days. I like github pages, but sometimes Jekyll is not my go-to solution.

My current setup is based on Jinja2 templates and a Python script that generates the site locally, served by nginx.

Whenever I make a change, I simply need to get the latest version from the repository and run the script:
```
git pull && python build_site.py
```

This usally involves doing `ssh` to a remote machine and run the script (I should have bundled both into a single `ssh` command, I know).
The setup is fine for me, but not for my teammates. Whenever they make a change, they need me to push it live. This is not ideal.
Also:
* most of them are not very comfortable with `ssh`
* `ssh` requires to share some keys
* etc.

The solution I am presenting lets anyone force a site refresh (i.e. running the `git pull && python build_site.py` command) by invoking an endpoint over HTTP.

Some important details:
* The content of the website is owned by user `nyc-response-lab`.
* The github repo is public (but private would work as well using deployed keys).
* nginx is running as user `www-data`.

First, you need to create a script that does what you want.
In our case, this is just freshing the repo and building the site
```
# Content of file `update_site.sh`
git pull && python build_site.py
```

Second, you need to make sure that user `www-data` can run this script as user `nyc-response-lab`. You can achieve that using `sudo` and adding the following line in the `/etc/sudoers` file:
```
www-data ALL=(ALL:ALL) NOPASSWD:/bin/bash /home/nyc-response-lab/update_site.sh
```

Third and last, you need to create an end-point that will execute the command. I am using Lua to get the job done.
```
  location /__end_point_to_use_to_refresh_the_content__ {
     default_type 'text/plain';
     content_by_lua_block {
       local command = "/usr/bin/sudo -u nyc-response-lab /bin/bash /home/nyc-response-lab/update_site.sh"
       local handle = io.popen(command)
       local result = handle:read("*a")
       handle:close()
       ngx.say('Refreshing Content ...')
       ngx.say(result)
    }
   }
```

`sudo -u nyc-response-lab` lets user `www-data` impersonate user `nyc-response-lab`.
Because of the entry in the `/etc/sudoers` file, user `www-data` has the right to run script `/home/nyc-response-lab/update_site.sh`

When my teammates point their browser to `http://responselabnyc.com/`, the script gets executed and they get back something like:
```
Refreshing Content ...
Success
```

Et voilà.

If you want to make it even more secure, you can protect the endpoint with a password.



