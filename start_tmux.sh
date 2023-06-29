#!/bin/bash
if [ "$TERM_PROGRAM" == "vscode" ]; then
  tmux start-server \; has-session -t "lani dev environment" 2>/dev/null
  if [ $? -eq 1 ] # not found
  then 
    tmux start-server \; source-file tmux.conf \; detach 1>/dev/null
    echo -e "The \033[36mlani dev environment\033[m is running in a detached \033[32mtmux\033[m session.".
    echo -e "You can now open your terminal of choice and execute:"
    echo
    echo -e "$ \033[32mtmux\033[m a -t \033[36m\"lani dev environment\"\033[m"
    echo
    echo -e "This way, even if you close vscode, the dev environment will still be running."
  else
    echo -e "\033[32mtmux\033[m is alreaddy running a \033[36m\"lani dev environment\"\033[m session."
    echo -e "You can attach to it by executing:"
    echo
    echo -e "$ \033[32mtmux\033[m a -t \033[36m\"lani dev environment\"\033[m"
    echo
    echo -n -e "Do you want to kill that session and create a new one?\033[30m (y/N)\033[0m "
    read yn
    case $yn in
      [yY] ) 
        tmux kill-session -t "lani dev environment" \; source-file tmux.conf \; detach 1>/dev/null;
        echo -e "The \033[36mlani dev environment\033[m is running in a detached \033[32mtmux\033[m session.".
        echo -e "You can now open your terminal of choice and execute:"
        echo
        echo -e "$ \033[32mtmux\033[m a -t \033[36m\"lani dev environment\"\033[m"
        echo
        ;;
    esac
  fi

  echo -e "Happy Hacking! 🚀"
else
  tmux source-file tmux.conf \; attach
fi
